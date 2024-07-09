/*
 * This file was automatically generated from the source file: func.ts.in.
 * Any edits should be made to the template file before re-running the codegen.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  Vec2i,
  Vec2f,
  Vec3i,
  Vec3f,
  Vec4i,
  Vec4f,
  Mat2f,
  Mat3f,
  Mat4f,
  UnitCell,
  VolumeAsset,
  TriangleMeshAsset,
  CustomShapeAsset,
  ParametrizationAsset,
  LineNetworkAsset,
  LineNetworkBvhAsset,
  MeshBvhAsset,
} from "./func-types.js"
/* eslint-enable @typescript-eslint/no-unused-vars */
import {
  Func,
  FuncType,
  TypedFunc,
  POINT_SOURCE,
} from "./func-types.js"

/** Enum variants for CSG.operation. */
export type CSG_Enum_operation = "Intersect" | "Subtract" | "Union"

/** Optional parameters for the CSG operator. */
export interface CSG_Parameters {
  operation?: CSG_Enum_operation
  smoothing?: number
}

/** Compose function call to CSG. */
export function CSG(
  a: TypedFunc<FuncType.Float>,
  b: TypedFunc<FuncType.Float>,
  parameters?: CSG_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "CSG",
    {
      "A": a,
      "B": b,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the ComputeNormals operator. */
export interface ComputeNormals_Parameters {
  volume_offset?: Vec3f
  volume_size?: Vec3f
  xform?: Mat4f
}

/** Compose function call to ComputeNormals. */
export function ComputeNormals(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  volume: Func,
  parameters?: ComputeNormals_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "ComputeNormals",
    {
      "Points": points,
      "Volume": volume,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Optional parameters for the GenerateSamplePoints operator. */
export interface GenerateSamplePoints_Parameters {
  offset?: Vec3f
  resolution?: Vec3i
  size?: Vec3f
  xform?: Mat4f
}

/** Compose function call to GenerateSamplePoints. */
export function GenerateSamplePoints(
  parameters?: GenerateSamplePoints_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "GenerateSamplePoints",
    undefined,
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Enum variants for GradeCellSize.shape_type. */
export type GradeCellSize_Enum_shape_type = "Box" | "Cylinder" | "Ellipsoid" | "Plane"

/** Optional parameters for the GradeCellSize operator. */
export interface GradeCellSize_Parameters {
  num_steps?: number
  offset?: number
  shape_size?: Vec3f
  shape_type?: GradeCellSize_Enum_shape_type
  shape_xform?: Mat4f
  step_size?: number
  width?: number
  xform?: Mat4f
}

/** Compose function call to GradeCellSize. */
export function GradeCellSize(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: GradeCellSize_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "GradeCellSize",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Optional parameters for the InterpolateBoundaryCoords operator. */
export interface InterpolateBoundaryCoords_Parameters {
  tolerance?: number
  xform?: Mat4f
}

/** Compose function call to InterpolateBoundaryCoords. */
export function InterpolateBoundaryCoords(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  boundary_data: ParametrizationAsset,
  mesh_data: TriangleMeshAsset,
  parameters?: InterpolateBoundaryCoords_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "InterpolateBoundaryCoords",
    {
      "Points": points,
    },
    {
      boundary_data,
      mesh_data,
    },
    parameters,
    FuncType.Vec3f,
  )
}

/** Optional parameters for the LinearFilter operator. */
export interface LinearFilter_Parameters {
  scale_a?: number
  scale_b?: number
}

/** Compose function call to LinearFilter. */
export function LinearFilter(
  inputa: TypedFunc<FuncType.Float>,
  inputb: TypedFunc<FuncType.Float>,
  parameters?: LinearFilter_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "LinearFilter",
    {
      "InputA": inputa,
      "InputB": inputb,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the LoadSamplePoints operator. */
export interface LoadSamplePoints_Parameters {
  points?: Vec3f
}

/** Compose function call to LoadSamplePoints. */
export function LoadSamplePoints(
  parameters?: LoadSamplePoints_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "LoadSamplePoints",
    undefined,
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Enum variants for LoadVolume.component_type. */
export type LoadVolume_Enum_component_type = "Byte" | "Float" | "Integer" | "None" | "Vec2f" | "Vec2i" | "Vec3f" | "Vec3i" | "Vec4f" | "Vec4i"

/** Optional parameters for the LoadVolume operator. */
export interface LoadVolume_Parameters {
  component_type?: LoadVolume_Enum_component_type
  resolution?: Vec3i
}

/** Compose function call to LoadVolume. */
export function LoadVolume(
  volume_data: VolumeAsset,
  parameters?: LoadVolume_Parameters,
): Func {
  return new Func(
    "LoadVolume",
    undefined,
    {
      volume_data,
    },
    parameters,
  )
}

/** Enum variants for MapTexturePrimitive.shape_type. */
export type MapTexturePrimitive_Enum_shape_type = "Box" | "Cylinder" | "Ellipsoid" | "Plane"

/** Optional parameters for the MapTexturePrimitive operator. */
export interface MapTexturePrimitive_Parameters {
  box_width?: Vec3f
  scale?: Vec2f
  shape_type?: MapTexturePrimitive_Enum_shape_type
  shape_xform?: Mat4f
  xform?: Mat4f
}

/** Compose function call to MapTexturePrimitive. */
export function MapTexturePrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  image: TypedFunc<FuncType.Float>,
  parameters?: MapTexturePrimitive_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "MapTexturePrimitive",
    {
      "Points": points,
      "Image": image,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Optional parameters for the Redistance operator. */
export interface Redistance_Parameters {
  post_offset?: number
  pre_offset?: number
}

/** Compose function call to Redistance. */
export function Redistance(
  samples: TypedFunc<FuncType.Float>,
  parameters?: Redistance_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "Redistance",
    {
      "Samples": samples,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Enum variants for SampleBeam.node_type. */
export type SampleBeam_Enum_node_type = "None" | "Sphere"

/** Enum variants for SampleBeam.section_type. */
export type SampleBeam_Enum_section_type = "Box" | "Circle" | "Cross"

/** Optional parameters for the SampleBeam operator. */
export interface SampleBeam_Parameters {
  node_radius?: number
  node_type?: SampleBeam_Enum_node_type
  section_radius?: number
  section_type?: SampleBeam_Enum_section_type
  smoothing?: number
  xform?: Mat4f
}

/** Compose function call to SampleBeam. */
export function SampleBeam(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  bvh_data: LineNetworkBvhAsset,
  network_data: LineNetworkAsset,
  parameters?: SampleBeam_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleBeam",
    {
      "Points": points,
    },
    {
      bvh_data,
      network_data,
    },
    parameters,
    FuncType.Float,
  )
}

/** Enum variants for SampleBox.shape_type. */
export type SampleBox_Enum_shape_type = "Box" | "BoxFrame" | "CappedCone" | "Capsule" | "Cylinder" | "Ellipsoid" | "Link" | "Plane" | "Torus"

/** Optional parameters for the SampleBox operator. */
export interface SampleBox_Parameters {
  free_param?: number
  shape_type?: SampleBox_Enum_shape_type
  size?: Vec3f
  xform?: Mat4f
}

/** Compose function call to SampleBox. */
export function SampleBox(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: SampleBox_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleBox",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the SampleCustomShape operator. */
export interface SampleCustomShape_Parameters {
  xform?: Mat4f
}

/** Compose function call to SampleCustomShape. */
export function SampleCustomShape(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  shader_data: CustomShapeAsset,
  parameters?: SampleCustomShape_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleCustomShape",
    {
      "Points": points,
    },
    {
      shader_data,
    },
    parameters,
    FuncType.Float,
  )
}

/** Enum variants for SampleLattice.node_type. */
export type SampleLattice_Enum_node_type = "None" | "Sphere"

/** Enum variants for SampleLattice.section_type. */
export type SampleLattice_Enum_section_type = "Box" | "Circle" | "Cross"

/** Optional parameters for the SampleLattice operator. */
export interface SampleLattice_Parameters {
  lattice_data?: UnitCell
  node_radius?: number
  node_type?: SampleLattice_Enum_node_type
  scale?: Vec3f
  scale_grading_range?: Vec2f
  scale_grading_scale?: Vec2f
  section_radius?: number
  section_radius_grading_range?: Vec2f
  section_radius_grading_scale?: Vec2f
  section_type?: SampleLattice_Enum_section_type
  smoothing?: number
  xform?: Mat4f
}

/** Compose function call to SampleLattice. */
export function SampleLattice(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: SampleLattice_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleLattice",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Enum variants for SampleSurfaceLattice.lattice_type. */
export type SampleSurfaceLattice_Enum_lattice_type = "CD" | "CI2Y" | "CP" | "CPM_Y" | "CS" | "CY" | "C_Y" | "D" | "F" | "FRD" | "Gyroid" | "I2Y" | "IWP" | "None" | "P" | "PM_Y" | "S" | "SD1" | "Schwarz" | "SchwarzD" | "SchwarzN" | "SchwarzPW" | "SchwarzW" | "W" | "Y"

/** Optional parameters for the SampleSurfaceLattice operator. */
export interface SampleSurfaceLattice_Parameters {
  lattice_type?: SampleSurfaceLattice_Enum_lattice_type
  scale?: Vec3f
  scale_grading_range?: Vec2f
  scale_grading_scale?: Vec2f
  threshold?: number
  threshold_grading_offset?: Vec2f
  threshold_grading_range?: Vec2f
  xform?: Mat4f
}

/** Compose function call to SampleSurfaceLattice. */
export function SampleSurfaceLattice(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: SampleSurfaceLattice_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleSurfaceLattice",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the SampleTriangleMesh operator. */
export interface SampleTriangleMesh_Parameters {
  cw_winding?: number
  xform?: Mat4f
}

/** Compose function call to SampleTriangleMesh. */
export function SampleTriangleMesh(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  mesh_data: TriangleMeshAsset,
  parameters?: SampleTriangleMesh_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleTriangleMesh",
    {
      "Points": points,
    },
    {
      mesh_data,
    },
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the SampleTriangleMeshBvh operator. */
export interface SampleTriangleMeshBvh_Parameters {
  xform?: Mat4f
}

/** Compose function call to SampleTriangleMeshBvh. */
export function SampleTriangleMeshBvh(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  bvh_data: MeshBvhAsset,
  mesh_data: TriangleMeshAsset,
  parameters?: SampleTriangleMeshBvh_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "SampleTriangleMeshBvh",
    {
      "Points": points,
    },
    {
      bvh_data,
      mesh_data,
    },
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the SampleVolume operator. */
export interface SampleVolume_Parameters {
  volume_offset?: Vec3f
  volume_size?: Vec3f
  xform?: Mat4f
}

/** Compose function call to SampleVolume. */
export function SampleVolume(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  volume: Func,
  parameters?: SampleVolume_Parameters,
): Func {
  return new Func(
    "SampleVolume",
    {
      "Points": points,
      "Volume": volume,
    },
    undefined,
    parameters,
  )
}

/** Optional parameters for the Shell operator. */
export interface Shell_Parameters {
  offset?: number
  thickness?: number
}

/** Compose function call to Shell. */
export function Shell(
  samples: TypedFunc<FuncType.Float>,
  parameters?: Shell_Parameters,
): TypedFunc<FuncType.Float> {
  return new TypedFunc<FuncType.Float>(
    "Shell",
    {
      "Samples": samples,
    },
    undefined,
    parameters,
    FuncType.Float,
  )
}

/** Optional parameters for the Threshold operator. */
export interface Threshold_Parameters {
  width?: number
}

/** Compose function call to Threshold. */
export function Threshold(
  samples: TypedFunc<FuncType.Float>,
  parameters?: Threshold_Parameters,
): TypedFunc<FuncType.Byte> {
  return new TypedFunc<FuncType.Byte>(
    "Threshold",
    {
      "Samples": samples,
    },
    undefined,
    parameters,
    FuncType.Byte,
  )
}

/** Optional parameters for the TransformCylindricalCoords operator. */
export interface TransformCylindricalCoords_Parameters {
  radial_scale?: number
  xform?: Mat4f
}

/** Compose function call to TransformCylindricalCoords. */
export function TransformCylindricalCoords(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: TransformCylindricalCoords_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "TransformCylindricalCoords",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Optional parameters for the TransformMirrorCoords operator. */
export interface TransformMirrorCoords_Parameters {
  mirror_normal?: Vec3f
  mirror_point?: Vec3f
  xform?: Mat4f
}

/** Compose function call to TransformMirrorCoords. */
export function TransformMirrorCoords(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: TransformMirrorCoords_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "TransformMirrorCoords",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Optional parameters for the TransformSphericalCoords operator. */
export interface TransformSphericalCoords_Parameters {
  xform?: Mat4f
}

/** Compose function call to TransformSphericalCoords. */
export function TransformSphericalCoords(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: TransformSphericalCoords_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "TransformSphericalCoords",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/** Enum variants for TransformTwistCoords.axis. */
export type TransformTwistCoords_Enum_axis = "X" | "Y" | "Z"

/** Optional parameters for the TransformTwistCoords operator. */
export interface TransformTwistCoords_Parameters {
  axis?: TransformTwistCoords_Enum_axis
  frequency?: number
  xform?: Mat4f
}

/** Compose function call to TransformTwistCoords. */
export function TransformTwistCoords(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters?: TransformTwistCoords_Parameters,
): TypedFunc<FuncType.Vec3f> {
  return new TypedFunc<FuncType.Vec3f>(
    "TransformTwistCoords",
    {
      "Points": points,
    },
    undefined,
    parameters,
    FuncType.Vec3f,
  )
}

/*
 * ----------------------------------------------------------------------------
 * Handwritten utility functions
 * ----------------------------------------------------------------------------
 */

/** Helper to generate the SDF for a Box primitive. */
export function BoxPrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Box" })
}

/** Helper to generate the SDF for a BoxFrame primitive. */
export function BoxFramePrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "BoxFrame" })
}

/** Helper to generate the SDF for a CappedCone primitive. */
export function CappedConePrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "CappedCone" })
}

/** Helper to generate the SDF for a Capsule primitive. */
export function CapsulePrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Capsule" })
}

/** Helper to generate the SDF for a Cylinder primitive. */
export function CylinderPrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Cylinder" })
}

/** Helper to generate the SDF for a Ellipsoid primitive. */
export function EllipsoidPrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Ellipsoid" })
}

/** Helper to generate the SDF for a Link primitive. */
export function LinkPrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Link" })
}

/** Helper to generate the SDF for a Plane primitive. */
export function PlanePrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Plane" })
}

/** Helper to generate the SDF for a Torus primitive. */
export function TorusPrimitive(
  points: TypedFunc<FuncType.Vec3f> = POINT_SOURCE,
  parameters: Omit<SampleBox_Parameters, "shape_type">,
): TypedFunc<FuncType.Float> {
  return SampleBox(points, { ...parameters, shape_type: "Torus" })
}

/** Helper to intersect two SDFs. */
export function CSGIntersect(
  a: TypedFunc<FuncType.Float>,
  b: TypedFunc<FuncType.Float>,
  smoothing?: number,
): TypedFunc<FuncType.Float> {
  const params: CSG_Parameters = { operation: "Intersect" }
  if (smoothing) { params.smoothing = smoothing }
  return CSG(a, b, params)
}

/** Helper to subtract two SDFs. */
export function CSGSubtract(
  a: TypedFunc<FuncType.Float>,
  b: TypedFunc<FuncType.Float>,
  smoothing?: number,
): TypedFunc<FuncType.Float> {
  const params: CSG_Parameters = { operation: "Subtract" }
  if (smoothing) { params.smoothing = smoothing }
  return CSG(a, b, params)
}

/** Helper to union two SDFs. */
export function CSGUnion(
  a: TypedFunc<FuncType.Float>,
  b: TypedFunc<FuncType.Float>,
  smoothing?: number,
): TypedFunc<FuncType.Float> {
  const params: CSG_Parameters = { operation: "Union" }
  if (smoothing) { params.smoothing = smoothing }
  return CSG(a, b, params)
}
