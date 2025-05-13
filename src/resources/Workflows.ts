import type { AxiosResponse } from "axios"
import type { Client } from "../client.js"
import { PollTimeout } from "../error.js"
import { constructParams } from "../util.js"

export type WorkflowState = "pending" | "started" | "success" | "failure" | "canceled"

export type WorkflowJSON = {
  /** Workflow ID. */
  id: string
  /** Workflow job IDs. */
  jobs: string[]
  /** Workflow state. */
  state: WorkflowState
  /** Workflow creation (RFC 1123) datetime. */
  created: string
  /** Workflow started (RFC 1123) datetime. */
  started: string | null
  /** Workflow finished (RFC 1123) datetime. */
  finished: string | null
  /** Workflow definition. */
  definition: string | null
  /** Project ID. */
  project_id: string
}

/** Workflow resource. */
export type Workflow = Omit<WorkflowJSON, "created" | "started" | "finished"> & {
  /** Workflow creation datetime. */
  created: Date
  /** Workflow started datetime. */
  started: Date | null
  /** Workflow finished datetime. */
  finished: Date | null
}

function workflow(w: WorkflowJSON): Workflow {
  return {
    ...w,
    created: new Date(w.created),
    started: w.started ? new Date(w.started) : null,
    finished: w.finished ? new Date(w.finished) : null,
  }
}

export interface ListParams {
  sort?: string
  q?: string
}

/** Metafold workflows endpoint. */
export class Workflows {
  constructor(private client: Client) {
  }

  /**
   * List workflows.
   *
   * @param {Object} [params] - Optional list parameters.
   * @param {string} [params.sort] - Sort string. For details on syntax see the Metafold API docs.
   *   Supported sorting fields are: "id", "created", "started", or "finished".
   * @param {string} [params.q] - Query string. For details on syntax see the Metafold API docs.
   *   Supported search fields are: "id" and "state".
   * @returns List of workflow resources.
   */
  async list({ sort, q }: ListParams = {}): Promise<Workflow[]> {
    const params = constructParams({ sort ,q })
    const r = await this.client.get(`/projects/${this.client.projectID}/workflows`, { params })
    return r.data.map(workflow)
  }

  /**
   * Get a workflow.
   *
   * @param {string} id - ID of workflow to get.
   * @returns Workflow resource.
   */
  async get(id: string): Promise<Workflow> {
    const r = await this.client.get(`/projects/${this.client.projectID}/workflows/${id}`)
    return workflow(r.data)
  }

  /**
   * Dispatch a new workflow and wait for the result.
   *
   * @param {string} definition - Workflow definition encoded as YAML.
   * @param {Object} [params] - Workflow parameters.
   * @param {Object} [assets] - Workflow assets.
   * @param {number} [timeout=12000] - Time in seconds to wait for a result.
   * @returns Completed workflow resource.
   */
  async run(
    definition: string,
    params?: object,
    assets?: object,
    timeout: number = 1000 * 60 * 2, // 2 mins
  ): Promise<Workflow> {
    const data = constructParams({ definition, assets, parameters: params })
    let r: AxiosResponse = await this.client.post(
      `/projects/${this.client.projectID}/workflows`, data, {
        headers: { "Content-Type": "application/json" },
      },
    )
    const url = r.data.link;
    try {
      r = await this.client.poll(url, timeout, 2)
    } catch (e) {
      if (e instanceof PollTimeout) {
        throw new Error(
          `Workflow failed to complete within ${timeout} ms`,
          { cause: e },
        )
      } else {
        throw e
      }
    }
    return workflow(r.data)
  }

  /**
   * Cancel a running workflow.
   *
   * @param {string} id - ID of workflow to canel.
   * @returns Workflow resource.
   */
  async cancel(id: string): Promise<Workflow> {
    const r = await this.client.post(`/projects/${this.client.projectID}/workflows/${id}/cancel`)
    return workflow(r.data)
  }

  /**
   * Delete a workflow.
   *
   * @param {string} id - ID of workflow to delete.
   */
  async delete(id: string) {
    await this.client.delete(`/projects/${this.client.projectID}/workflows/${id}`)
  }
}
