import type { AxiosInstance } from "axios"

export interface Client {
  projectID: string

  get: AxiosInstance["get"]
  put: AxiosInstance["put"]
  post: AxiosInstance["post"]
  patch: AxiosInstance["patch"]
  delete: AxiosInstance["delete"]
}
