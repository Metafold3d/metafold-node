import type { AxiosInstance } from "axios"
import type { Client } from "./client"
/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require("axios")
const Assets = require("./resources/Assets")
const Jobs = require("./resources/Jobs")
const User = require("./resources/User")
/* eslint-enable @typescript-eslint/no-var-requires */

const DEFAULT_BASE_URL = "https://api.metafold3d.com"

/** Metafold REST API client. */
class MetafoldClient implements Client {
  /**
   * Endpoint for managing asset resources.
   * @type {Assets}
   */
  assets: typeof Assets

  /**
   * Endpoint for managing job resources.
   * @type {Jobs}
   */
  jobs: typeof Jobs

  /**
   * Endpoint for querying user information.
   * @type {User}
   */
  user: typeof User

  /** Underlying HTTP client. */
  axios: AxiosInstance

  get: AxiosInstance["get"]
  put: AxiosInstance["put"]
  post: AxiosInstance["post"]
  patch: AxiosInstance["patch"]
  delete: AxiosInstance["delete"]

  /**
   * Create a client.
   *
   * @param {string} accessToken - Metafold API secret key.
   * @param {string} projectID - ID of the project to make API calls against.
   * @param {string} [baseURL] - Metafold API URL. Used for internal testing.
   */
  constructor(accessToken: string, public projectID: string, baseURL: string = DEFAULT_BASE_URL) {
    this.axios = axios.create({
      baseURL,
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    })
    this.axios.interceptors.response.use(
      (r) => r,
      (err) => {
        if (err.response) {
          const r = err.response
          // Error responses aren't entirely consistent in the Metafold API,
          // for now we check for a handful of possible fields.
          if (r.data.errors) {
            const msg = r.data.errors.map((e: { field?: string, msg: string }) => {
              if (e.field) {
                return `  [${e.field}] ${e.msg}`
              }
              return `  ${e.msg}`
            }).join("\n")
            return Promise.reject(new Error(`Bad request:\n${msg}`, { cause: err }))
          }
          const reason = r.data?.msg ?? r.data?.description
          return Promise.reject(new Error(`${reason ?? r.statusText}`, { cause: err }))
        }
        return Promise.reject(err)
      },
    )

    this.get = this.axios.get
    this.put = this.axios.put
    this.post = this.axios.post
    this.patch = this.axios.patch
    this.delete = this.axios.delete

    this.assets = new Assets(this)
    this.jobs = new Jobs(this)
    this.user = new User(this)
  }
}
export = MetafoldClient
