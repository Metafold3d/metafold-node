import type { Vector2, Vector3, Vector4, Matrix3, Matrix4 } from "three"

export type Vec2 = Vector2 | [number, number]
export type Vec2i = Vec2
export type Vec2f = Vec2

export type Vec3 = Vector3 | [number, number, number]
export type Vec3i = Vec3
export type Vec3f = Vec3

export type Vec4 = Vector4 | [number, number, number, number]
export type Vec4i = Vec4
export type Vec4f = Vec4

export type Mat2 = [number, number, number, number]
export type Mat2f = Mat2

export type Mat3 = Matrix3 | [
  number, number, number,
  number, number, number,
  number, number, number,
]
export type Mat3f = Mat3

export type Mat4 = Matrix4 | [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
]
export type Mat4f = Mat4

export type UnitCell = {
  nodes: Vec3[]
  edges: Vec2[]
}

export enum FuncType {
  Byte  = "Byte",
  Int   = "Int",
  Float = "Float",
  Vec2i = "Vec2i",
  Vec2f = "Vec2f",
  Vec3i = "Vec3i",
  Vec3f = "Vec3f",
  Vec4i = "Vec4i",
  Vec4f = "Vec4f",
  Mat2f = "Mat2f",
  Mat3f = "Mat3f",
  Mat4f = "Mat4f",
}

export type Asset = { path: string }

export type VolumeAsset = Asset & {
  file_type: "Raw"
}

export type TriangleMeshAsset = Asset & {
  file_type: "MeshFile"
}

export type CustomShapeAsset = Asset & {
  file_type: "ShaderBinarySPIRV"
}

export type ParametrizationAsset = Asset
export type LineNetworkAsset = Asset
export type LineNetworkBvhAsset = Asset

export type Graph = {
  operators: {
    type: string
    parameters?: object
  }[]
  edges?: {
    source: number
    target: [number, string]
  }[]
}

const pointSourceVarType = "_PointSource"

/**
 * Instance of a function.
 * Function instances may be composed with other functions to build shape graphs.
 */
export class Func {
  constructor(
    readonly type: string,
    readonly inputs?: { [key: string]: Func },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly parameters?: { [key: string]: any },
  ) {}

  /**
   * Resolve function call tree to a Metafold shape graph.
   */
  json(points?: TypedFunc<FuncType.Vec3f>): Graph {
    if (this.type === pointSourceVarType) {
      throw new Error("Failed to resolve point source")
    }

    // Build DAG edges by walking up function dependencies, i.e. in reverse graph order
    type DAG = {
      nodes: Set<Func>
      edges: Map<Func, { name: string, func: Func }[]>
    }
    const dag: DAG = {
      nodes: new Set(),
      edges: new Map(),
    }

    const toVisit: Func[] = [this]

    while (toVisit.length > 0) {
      const func = toVisit.pop()!
      if (dag.nodes.has(func))
        continue

      dag.nodes.add(func)

      for (const [name, source_] of Object.entries(func.inputs ?? {})) {
        let source = source_
        if (source_.type === pointSourceVarType) {
          if (!points || points.type === pointSourceVarType) {
            throw new Error("Expected valid point source")
          }
          source = points
        }

        toVisit.push(source)

        if (!dag.edges.has(source))
          dag.edges.set(source, [])

        dag.edges.get(source)!.push({ name, func })
      }
    }

    // TODO(ryan): Sort graph in topological order so that edge indices make more sense

    const indices = new Map()
    const g: Graph = {
      operators: [],
      edges: [],
    }

    type Operator = Graph["operators"][0]
    for (const func of dag.nodes.values()) {
      const operator: Operator = { type: func.type }
      if (func.parameters) {
        operator.parameters = Object.fromEntries(
          Object.entries(func.parameters).map(([k, v]) => {
            // Convert three.js types to arrays
            if (typeof v === "object" && "toArray" in v && typeof v.toArray === "function")
              return [k, v.toArray()]
            return [k, v]
          })
        )
      }
      const index = g.operators.push(operator) - 1
      indices.set(func, index)
    }

    for (const [source, targets] of Array.from(dag.edges.entries())) {
      const sourceIndex = indices.get(source)!
      for (const { func, name: targetName } of targets) {
        const targetIndex = indices.get(func)!
        g.edges!.push({
          source: sourceIndex,
          target: [targetIndex, targetName],
        })
      }
    }

    return g
  }
}

/** Typed instance of a function to enable type checking for function compositions. */
export class TypedFunc<T> extends Func {
  constructor(
    type: string,
    inputs?: { [key: string]: Func },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters?: { [key: string]: any },
    // Generic parameters are erased unless they are used in the type
    private returnType?: T,
  ) {
    super(type, inputs, parameters)
  }
}

/**
 * Dummy point source.
 * May be used in place of the (primary) point source for an operator to defer provision of a point
 * source until graph resolution. This allows you to re-use a function composition with different
 * point sources.
 */
export const POINT_SOURCE = new TypedFunc<FuncType.Vec3f>(pointSourceVarType)
