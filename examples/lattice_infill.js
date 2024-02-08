/* Example script demonstrating filling a triangle mesh with a gyroid.
 *
 * Usage:
 *     node examples/lattice_infill.js -t <token> -p <project> examples/suzanne.obj suzanne_gyroid.stl
 *
 * This is a port of the same example in the Metafold SDK for Python:
 * https://github.com/Metafold3d/metafold-python/blob/master/examples/lattice_infill.py
 *
 * Please refer to the Python example for more details.
 */
"use strict"

const fs = require("fs")
const path = require("path")
const { program } = require("commander")
const MetafoldClient = require("../lib/metafold")

async function exec(infile, outfile, opts) {
  const token = opts.token ?? process.env.METAFOLD_ACCESS_TOKEN
  if (!token) {
    console.error("access token is required")
    process.exit(1)
  }

  const metafold = new MetafoldClient(token, opts.project)

  console.log("Uploading mesh asset...")
  const filename = path.basename(infile)
  const existing = await metafold.assets.list({ q: `filename:${filename}` })

  const data = fs.readFileSync(infile)
  const file = new File([data], filename)
  let mesh = null
  if (existing && existing.length > 0) {
    mesh = await metafold.assets.update(existing[0].id, file)
  } else {
    mesh = await metafold.assets.create(file)
  }

  console.log("Running sample_triangle_mesh job...")
  const sampleMesh = await metafold.jobs.run("sample_triangle_mesh", {
    mesh_filename: mesh.filename,
    max_resolution: 256,
  })

  const volumeFilename = sampleMesh.assets[0].filename
  const patch = sampleMesh.meta.patch
  const graph = createGraph(volumeFilename, patch)

  console.log("Running export_triangle_mesh job...")
  const exportMesh = await metafold.jobs.run("export_triangle_mesh", {
    graph,
    point_source: 0,
  })

  console.log("Downloading generated mesh asset...")
  const fd = fs.openSync(outfile, "a")
  try {
    const r = await metafold.assets.download(exportMesh.assets[0].id)
    for await (const chunk of r.data) {
      fs.appendFileSync(fd, chunk)
    }
  } finally {
    fs.closeSync(fd)
  }
}

async function main() {
  program
    .argument("<infile>", "mesh file")
    .argument("<outfile>", "output file")
    .option("-t, --token <token>", "access token")
    .requiredOption("-p, --project <id>", "project id")
    .action(exec)

  await program.parseAsync(process.argv)
}

function createGraph(volumeFilename, patch) {
  // SDF narrow-band width is relative to grid cell size
  const cellSize = [
    patch.size[0] / (patch.resolution[0] - 1),
    patch.size[1] / (patch.resolution[1] - 1),
    patch.size[2] / (patch.resolution[2] - 1),
  ]
  const thresholdWidth = 3.0 * Math.sqrt(
      Math.pow(cellSize[0], 2)
    + Math.pow(cellSize[1], 2)
    + Math.pow(cellSize[2], 2)
  )
  return {
    operators: [
      {
        type: "GenerateSamplePoints",
        parameters: {
          ...patch
        },
      },
      {
        type: "LoadVolume",
        parameters: {
          volume_data: {
            file_type: "Raw",
            path: volumeFilename,
          },
          resolution: patch.resolution,
        },
      },
      {
        type: "SampleVolume",
        parameters: {
          volume_offset: patch.offset,
          volume_size: patch.size,
        },
      },
      {
        type: "SampleSurfaceLattice",
        parameters: {
          lattice_type: "Gyroid",
          scale: [10.0, 10.0, 10.0],
        },
      },
      {
        type: "CSG",
        parameters: {
          operation: "Intersect",
        },
      },
      {
        type: "Redistance",
        parameters: {
          size: patch.size,
        }
      },
      {
        type: "Threshold",
        parameters: {
          width: thresholdWidth,
        }
      },
    ],
    edges: [
      {source: 0, target: [2, "Points"]},  // GenerateSamplePoints -> SampleVolume
      {source: 1, target: [2, "Volume"]},  // LoadVolume -> SampleVolume
      {source: 2, target: [4, "A"]},       // SampleVolume -> CSG
      {source: 0, target: [3, "Points"]},  // GenerateSamplePoints -> SampleSurfaceLattice
      {source: 3, target: [4, "B"]},       // SampleSurfaceLattice -> CSG
      {source: 4, target: [5, "Samples"]}, // CSG -> Redistance
      {source: 5, target: [6, "Samples"]}, // Redistance -> Threshold
    ]
  }
}

main()
