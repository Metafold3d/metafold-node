/* Example script demonstrating filling a triangle mesh with a gyroid.
 *
 * Usage:
 *     node examples/surface_lattice_metrics.js -t <token> -p <project>
 *
 * This is a port of the same example in the Metafold SDK for Python:
 * https://github.com/Metafold3d/metafold-python/blob/master/examples/surface_lattice_metrics.py
 *
 * Please refer to the Python example for more details.
 *
 * Note this example takes advantage of async/await in Javascript to run jobs concurrently.
 */
"use strict"

const { program } = require("commander")
const MetafoldClient = require("../lib/metafold")

const latticeTypes = [
    "Gyroid",
    "SchwarzD",
    "I2Y",
    "CI2Y",
    "S",
    "SD1",
    "P",
    "F",
    "Schwarz",
    "D",
    "IWP",
    "CD",
    "CP",
    "CY",
    "CS",
    "W",
    "Y",
    "C_Y",
    "PM_Y",
    "CPM_Y",
    "FRD",
    "SchwarzN",
    "SchwarzW",
    "SchwarzPW",
]

async function exec(opts) {
  const token = opts.token ?? process.env.METAFOLD_ACCESS_TOKEN
  if (!token) {
    console.error("access token is required")
    process.exit(1)
  }

  const metafold = new MetafoldClient(token, opts.project)

  await Promise.allSettled(latticeTypes.map(async (t) => {
    console.log(`Running evaluate_metrics (${t}) job...`)
    const job = await metafold.jobs.run("evaluate_metrics", {
      graph: {
        operators: [
          {
            type: "GenerateSamplePoints",
            parameters: {
              size: [1.0, 1.0, 1.0],
              resolution: [64, 64, 64],
            },
          },
          {
            type: "SampleSurfaceLattice",
            parameters: {
              lattice_type: t,
              scale: [1.0, 1.0, 1.0],
            },
          },
          {
            type: "Redistance",
            parameters: {
              size: [1.0, 1.0, 1.0],
            },
          },
          {
            type: "Threshold",
            parameters: {
              width: 0.04,
            },
          },
        ],
        edges: [
          {source: 0, target: [1, "Points"]},
          {source: 1, target: [2, "Samples"]},
          {source: 2, target: [3, "Samples"]},
        ],
      },
      point_source: 0,
    })
    console.log(`${t}:`)
    console.log(job.meta)
  }))
}

async function main() {
  program
    .option("-t, --token <token>", "access token")
    .requiredOption("-p, --project <id>", "project id")
    .action(exec)

  await program.parseAsync(process.argv)
}

main()
