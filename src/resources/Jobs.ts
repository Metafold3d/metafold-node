import type { AxiosPromise, AxiosResponse } from "axios"
import type { Asset, AssetJSON } from "./Assets"
import type { Client } from "../client"
/* eslint-disable @typescript-eslint/no-var-requires */
const { PollTimeout } = require("../error")
const { constructParams } = require("../util")
/* eslint-enable @typescript-eslint/no-var-requires */

type Timeout = ReturnType<typeof setTimeout>

export type JobState = "pending" | "started" | "success" | "failure"

export type JobJSON = {
  /** Job ID. */
  id: string
  /** Job name. */
  name?: string
  /** Job type. */
  type: string
  /** Job parameters. */
  parameters: object
  /** Job creation (RFC 1123) datetime. */
  created: string
  /** Job state. */
  state: JobState
  /** List of generated asset JSONs. */
  assets: AssetJSON[]
  /** Additional metadata generated by the job. */
  meta: object | null
}

/** Job resource. */
export type Job = Omit<JobJSON, "created" | "assets"> & {
  /** Job creation datetime. */
  created: Date
  /** List of generated asset resources. */
  assets: Asset[]
}

function job(j: JobJSON): Job {
  return {
    ...j,
    created: new Date(j.created),
    assets: j.assets.map((a: AssetJSON) => ({
      ...a,
      created: new Date(a.created),
      modified: new Date(a.modified),
    }))
  }
}

export interface ListParams {
  sort?: string
  q?: string
}

export interface RunParams {
  name?: string
  timeout: number
}

/** Metafold jobs endpoint. */
class Jobs {
  constructor(private client: Client) {
  }

  /**
   * List jobs.
   *
   * @param {Object} [params] - Optional list parameters.
   * @param {string} [params.sort] - Sort string. For details on syntax see the Metafold API docs.
   *   Supported sorting fields are: "id", "name", or "created".
   * @param {string} [params.q] - Query string. For details on syntax see the Metafold API docs.
   *   Supported search fields are: "id", "name", "type", and "state".
   * @returns List of job resources.
   */
  async list({ sort, q }: ListParams = {}): Promise<Job[]> {
    const params = constructParams({ sort ,q })
    const r = await this.client.get(`/projects/${this.client.projectID}/jobs`, { params })
    return r.data.map(job)
  }

  /**
   * Get a job.
   *
   * @param {string} id - ID of job to get.
   * @returns Job resource.
   */
  async get(id: string): Promise<Job> {
    const r = await this.client.get(`/projects/${this.client.projectID}/jobs/${id}`)
    return job(r.data)
  }

  /**
   * Dispatch a new job and wait for the result.
   *
   * See Metafold API docs for the full list of jobs.
   *
   * @param {string} type - Job type.
   * @param {Object} params - Job parameters.
   * @param {string} [name] - Job name.
   * @param {number} [timeout=12000] - Time in seconds to wait for a result.
   * @returns Completed job resource.
   */
  async run(
    type: string,
    params: object,
    name?: string,
    timeout: number = 1000 * 60 * 2, // 2 mins
  ): Promise<Job> {
    const url = await this.runStatus(type, params, name);
    let r = null;
    try {
      r = await this.poll(url, timeout)
    } catch (e) {
      if (e instanceof PollTimeout) {
        throw new Error(
          `Job '${name ?? type}' failed to complete within ${timeout} ms`,
          { cause: e },
        )
      } else {
        throw e
      }
    }
    return job(r.data)
  }


  /**
   * Dispatch a new job and return immediately without waiting for result.
   *
   * See Metafold API docs for the full list of jobs.
   *
   * @param {string} type - Job type.
   * @param {Object} params - Job parameters.
   * @param {string} [name] - Job name.
   * @returns {string} Job status url.
   */
  async runStatus(type: string, params: object, name?: string): Promise<string> {
    const data = constructParams({ type, parameters: params, name })
    const r: AxiosResponse = await this.client.post(
      `/projects/${this.client.projectID}/jobs`, data, {
        headers: { "Content-Type": "application/json" },
      },
    )
    return r.data.link;
  }

  /**
   * Poll the given URL every one second.
   *
   * Helpful for waiting on job results given a status URL.
   *
   * @param {string} url - Job status url.
   * @param {number} [timeout=12000] - Time in seconds to wait for a result.
   * @returns Completed job resource.
   */
  poll(url: string, timeout: number = 1000 * 60 * 2): AxiosPromise {
    return new Promise((resolve, reject) => {
      /* eslint-disable prefer-const */
      let intervalID: Timeout
      let timeoutID: Timeout
      /* eslint-enable prefer-const */

      const clearTimers = () => {
        clearInterval(intervalID)
        clearTimeout(timeoutID)
      }

      intervalID = setInterval(() => {
        this.client.get(url)
          .then((r) => {
            if (r.status === 202) {
              return
            }
            clearTimers()
            resolve(r)
          })
          .catch((e) => {
            clearTimers()
            reject(e)
          })
      }, 1000)

      timeoutID = setTimeout(() => {
        clearInterval(intervalID)
        reject(new PollTimeout("Job timed out"))
      }, timeout)
    })
  }

  /**
   * Update a job.
   *
   * @param {string} id - ID of job to update.
   * @param {Object} [params] - Optional update parameters.
   * @param {string} [params.name] - New job name. The existing name remains unchanged if undefined.
   * @returns Update job resource.
   */
  async update(id: string, { name }: { name?: string } = {}): Promise<Job> {
    const data = constructParams({ name })
    const r = await this.client.patch(`/projects/${this.client.projectID}/jobs/${id}`, data)
    return job(r.data)
  }
}
module.exports = Jobs
