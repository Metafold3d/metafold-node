import { strict as assert } from "assert"
import { Vector3 } from "three"
import type {
  SampleBox_Parameters,
  SampleSurfaceLattice_Parameters,
} from "./func.js"
import {
  CSGIntersect,
  GenerateSamplePoints,
  Redistance,
  SampleBox,
  SampleSurfaceLattice,
  Threshold,
} from "./func.js"
import type { Graph } from "./func-types.js"
import { POINT_SOURCE } from "./func-types.js"


describe("Func", function() {
  const source = GenerateSamplePoints({
    size: [2, 2, 2],
    resolution: [64, 64, 64],
  })

  const sphereSize = new Vector3(1, 1, 1)
  const sphereParams: SampleBox_Parameters = {
    shape_type: "Ellipsoid",
    size: sphereSize,
  }
  const gyroidParams: SampleSurfaceLattice_Parameters = {
    lattice_type: "Gyroid",
    scale: [0.25, 0.25, 0.25],
  }

  // NOTE: This should fail to compile
  // Redistance(CSGIntersect(source, SampleBox(source, sphereParams)))

  const want: Graph = {
    operators: [
      { type: "Threshold" },
      { type: "Redistance" },
      {
        type: "CSG",
        parameters: {
          operation: "Intersect",
        },
      },
      {
        type: "SampleBox",
        parameters: {
          shape_type: "Ellipsoid",
          size: [1, 1, 1],
        },
      },
      {
        type: "GenerateSamplePoints",
        parameters: {
          size: [2, 2, 2],
          resolution: [64, 64, 64],
        },
      },
      {
        type: "SampleSurfaceLattice",
        parameters: {
          lattice_type: "Gyroid",
          scale: [0.25, 0.25, 0.25],
        },
      },
    ],
    edges: [
      { source: 1, target: [0, "Samples"] }, //           Redistance -> Threshold
      { source: 2, target: [1, "Samples"] }, //                  CSG -> Redistance
      { source: 5, target: [2, "A"] },       // SampleSurfaceLattice -> CSG
      { source: 3, target: [2, "B"] },       //            SampleBox -> CSG
      { source: 4, target: [3, "Points"] },  // GenerateSamplePoints -> SampleBox
      { source: 4, target: [5, "Points"] },  // GenerateSamplePoints -> SampleSurfaceLattice
    ],
  }

  describe("#json()", function() {
    it("should generate a valid shape graph", function() {
      const f = Threshold(
        Redistance(
          CSGIntersect(
            SampleSurfaceLattice(source, gyroidParams),
            SampleBox(source, sphereParams),
          ),
        ),
      )
      assert.deepEqual(f.json(), want)
    })

    it("should generate a valid shape graph using a deferred point source", function() {
      const f = Threshold(
        Redistance(
          CSGIntersect(
            SampleSurfaceLattice(POINT_SOURCE, gyroidParams),
            SampleBox(POINT_SOURCE, sphereParams),
          ),
        ),
      )
      assert.deepEqual(f.json(source), want)
    })
  })
})
