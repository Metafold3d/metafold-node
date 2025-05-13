import type { AxiosInstance, AxiosPromise } from "axios"

export interface Client {
  projectID?: string

  get: AxiosInstance["get"]
  put: AxiosInstance["put"]
  post: AxiosInstance["post"]
  patch: AxiosInstance["patch"]
  delete: AxiosInstance["delete"]

  poll: (url: string, timeout: number, every: number) => AxiosPromise
}
