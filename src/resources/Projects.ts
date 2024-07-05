import type { Client } from "../client.js"
import type { Graph } from "../func-types.js"
import { constructParams } from "../util.js"

export type Access = "private" | "public"

export type ProjectJSON = {
  /** Project ID. */
  id: string
  /** User ID. */
  user: string
  /** Project name. */
  name?: string
  /** Project access. */
  access: Access
  /** Project creation (RFC 1123) datetime. */
  created: string
  /** Project last modified (RFC 1123) datetime. */
  modified: string
  /** Arbitrary project data. */
  project?: object
  /** Project graph data. */
  graph?: Graph
}

/** Project resource. */
export type Project = Omit<ProjectJSON, "created" | "modified"> & {
  /** Project creation datetime. */
  created: Date
  /** Project last modified datetime. */
  modified: Date
}

function project(p: ProjectJSON): Project {
  return {
    ...p,
    created: new Date(p.created),
    modified: new Date(p.modified),
  }
}

export interface ListParams {
  sort?: string
  q?: string
}

export interface UpdateParams {
  name?: string
  access?: Access
  data?: object
  graph?: Graph
}

/** Metafold projects endpoint. */
export class Projects {
  constructor(private client: Client) {
  }

  /**
   * List projects.
   *
   * @param {Object} [params] - Optional list parameters.
   * @param {string} [params.sort] - Sort string. For details on syntax see the Metafold API docs.
   *   Supported sorting fields are: "id", "user", "name", "created", or "modified".
   * @param {string} [params.q] - Query string. For details on syntax see the Metafold API docs.
   *   Supported search fields are: "id", "user", and "name".
   * @returns List of project resources.
   */
  async list({ sort, q }: ListParams = {}): Promise<Project[]> {
    const params = constructParams({ sort ,q })
    const r = await this.client.get(`/projects`, { params })
    return r.data.map(project)
  }

  /**
   * Get a project.
   *
   * @param {string} [id] - Override ID of project to get. Defaults to client project ID.
   * @returns Project resource.
   */
  async get(id?: string): Promise<Project> {
    const r = await this.client.get(`/projects/${id ?? this.client.projectID}`)
    return project(r.data)
  }

  /**
   * Create a project.
   *
   * @param {string} name - Name of the project.
   * @param {string} [access] - Project access. By default projects are private.
   * @param {Object} [data] - Optional project data. This parameter accepts arbitrary
   *   JSON-serializable data. Helpful for tracking application state.
   * @returns Project resource.
   */
  async create(name: string, access: Access = "private", data?: object): Promise<Project> {
    const payload = constructParams({ name, access, project: data })
    const r = await this.client.post(`/projects`, payload, {
        headers: { "Content-Type": "application/json" },
      },
    )
    return project(r.data)
  }

  /**
   * Duplicate a project.
   *
   * @param {string} id - Project to duplicate.
   * @param {string} name - New project name.
   * @param {string} [access] - New project access. By default projects are private.
   * @returns Project resource.
   */
  async duplicate(id: string, name: string, access: Access = "private"): Promise<Project> {
    const payload = constructParams({ source: id, name, access })
    const r = await this.client.post(`/projects`, payload, {
        headers: { "Content-Type": "application/json" },
      },
    )
    return project(r.data)
  }

  /**
   * Update a project.
   *
   * @param {string} [id] - Override ID of project to update. Defaults to client project ID.
   * @param {Object} [params] - Optional update parameters.
   * @param {string} [params.name] - Optional project name.
   * @param {string} [params.access] - Optional project access.
   * @param {Object} [params.data] - Optional project data. This parameter accepts arbitrary
   *   JSON-serializable data. Helpful for tracking application state.
   * @param {Object} [params.graph] - Optional shape JSON.
   * @returns Updated project resource.
   */
  async update(id?: string, { name, access, data, graph }: UpdateParams = {}): Promise<Project> {
    const payload = constructParams({ name, access, project: data, graph })
    const r = await this.client.patch(`/projects/${id ?? this.client.projectID}`, payload, {
        headers: { "Content-Type": "application/json" },
      },
    )
    return project(r.data)
  }

  /**
   * Delete a project.
   *
   * @param {string} [id] - Override ID of project to delete. Defaults to client project ID.
   */
  async delete(id?: string) {
    await this.client.delete(`/projects/${id ?? this.client.projectID}`)
  }
}
