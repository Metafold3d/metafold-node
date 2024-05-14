/*
 * Check types and run:
 * yarn tsc --module node16 --target es2022 --strict --verbatimModuleSyntax --noEmit examples/graph-builder.ts
 * yarn tsx examples/graph-builder.ts -t <token> -p <project>
 */
import fs from "fs"
import type { OptionValues } from "commander"
import { program } from "commander"
import MetafoldClient from "../src/metafold.js"
import {
  CSGIntersect,
  CSGUnion,
  CylinderPrimitive,
  EllipsoidPrimitive,
  GenerateSamplePoints,
  POINT_SOURCE,
  Redistance,
  SampleSurfaceLattice,
  Threshold,
} from "../src/metafold.js"

const f = Threshold(
  Redistance(
    CSGUnion(
      CSGIntersect(
        SampleSurfaceLattice(POINT_SOURCE, {
          lattice_type: "Gyroid",
          scale:        [0.1, 0.1, 0.1],
        }),
        EllipsoidPrimitive(POINT_SOURCE, { size: [2.0, 2.0, 2.0] }),
      ),
      CylinderPrimitive(POINT_SOURCE, {
        size:  [2.0, 2.0, 0.15],
        xform: [
           1.0,   0.0,   0.0,   0.0,
           0.0,   1.0,   0.0,   0.0,
           0.0,   0.0,   1.0,   0.0,
           0.0,   0.0,  -0.95,  1.0,
        ],
      }),
      0.1, // Smoothing
    ),
  ),
  {
    width: 0.04075,
  },
)

async function exec(opts: OptionValues) {
  const token = opts.token ?? process.env.METAFOLD_ACCESS_TOKEN
  if (!token) {
    console.error("access token is required")
    process.exit(1)
  }

  const metafold = new MetafoldClient(token, opts.project)

  for (const res of [64, 128, 265]) {
    const source = GenerateSamplePoints({
      size:       [2.0, 2.0, 2.0],
      offset:     [-1.0, -1.0, -1.0],
      resolution: [res, res, res],
    })
    const graph = f.json(source)
    const index = graph.operators.findIndex(({ type }) => type === "GenerateSamplePoints")

    console.log("Running export_triangle_mesh job...")
    const exportMesh = await metafold.jobs.run("export_triangle_mesh", {
      graph,
      point_source: index,
      file_type: "obj",
    })

    console.log("Downloading generated mesh asset...")
    const fd = fs.openSync(`out-${res}.obj`, "a")
    try {
      const r = await metafold.assets.download(exportMesh.assets[0].id)
      for await (const chunk of r.data) {
        fs.appendFileSync(fd, chunk)
      }
    } finally {
      fs.closeSync(fd)
    }
  }
}

async function main() {
  program
    .option("-t, --token <token>", "access token")
    .requiredOption("-p, --project <id>", "project id")
    .action(exec)

  await program.parseAsync(process.argv)
}

main()
