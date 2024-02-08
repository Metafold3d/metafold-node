import type { AxiosPromise, ResponseType } from "axios"
import type { Client } from "../client"
/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require("axios")
const { constructParams } = require("../util")
/* eslint-enable @typescript-eslint/no-var-requires */

export type AssetJSON = {
  /** Asset ID. */
  id: string
  /** Asset filename. */
  filename: string
  /** File size in bytes. */
  size: number
  /** File checksum. */
  checksum: string
  /** Asset creation (RFC 1123) datetime. */
  created: string
  /** Asset last modified (RFC 1123) datetime. */
  modified: string
}

/** Asset resource. */
export type Asset = Omit<AssetJSON, "created" | "modified"> & {
  /** Asset creation datetime. */
  created: Date
  /** Asset last modified datetime. */
  modified: Date
}

function asset(a: AssetJSON): Asset {
  return {
    ...a,
    created: new Date(a.created),
    modified: new Date(a.modified),
  }
}

export interface ListParams {
  sort?: string
  q?: string
}

/** Metafold assets endpoint. */
class Assets {
  constructor(private client: Client) {
  }

  /**
   * List assets.
   *
   * @param {Object} [params] - Optional list parameters.
   * @param {string} [params.sort] - Sort string. For details on syntax see the Metafold API docs.
   *   Supported sorting fields are: "id", "filename", "size", "created", or "modified".
   * @param {string} [params.q] - Query string. For details on syntax see the Metafold API docs.
   *   Supported search fields are: "id" and "filename".
   * @returns List of asset resources.
   */
  async list({ sort, q }: ListParams = {}): Promise<Asset[]> {
    const params = constructParams({ sort ,q })
    const r = await this.client.get(`/projects/${this.client.projectID}/assets`, { params })
    return r.data.map(asset)
  }

  /**
   * Get an asset.
   *
   * @param {string} id - ID of asset to get.
   * @returns Asset resource.
   */
  async get(id: string): Promise<Asset> {
    const r = await this.client.get(`/projects/${this.client.projectID}/assets/${id}`)
    return asset(r.data)
  }

  /**
   * Download an asset.
   *
   * @param {string} id - ID of asset to download.
   * @param {string} [responseType="stream"] - Type of response data.
   *   Options include: "arraybuffer", "document", "json", "text", or "stream".
   *   See {@link https://axios-http.com/docs/req_config|Axios docs} for details.
   * @returns Response object with asset data.
   */
  // TODO: Add support for axios onDownloadProgress callback
  async download(id: string, responseType: ResponseType = "stream"): AxiosPromise {
    const params = { download: true }
    const r = await this.client.get(`/projects/${this.client.projectID}/assets/${id}`, { params })
    return await axios.get(r.data.link, { responseType })
  }

  /**
   * Retrieve public asset download URL.
   *
   * @param {string} id - ID of asset to download.
   * @param {Object} [params] - Optional download parameters.
   * @param {string} [params.filename] - Filename of downloaded file.
   * @returns {string} Asset download URL. Note the URL is only valid from one hour of generation.
   */
  async downloadURL(id: string, { filename }: { filename?: string } = {}): Promise<string> {
    const params = constructParams({ download: true, filename })
    const r = await this.client.get(`/projects/${this.client.projectID}/assets/${id}`, { params })
    return r.data.link
  }

  /**
   * Upload an asset.
   *
   * @param {any} data - Asset data to upload, typically a File or Blob.
   * @param {string} [filename] - Name of the file.
   * @returns Asset resource.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async create(data: any, filename?: string): Promise<Asset> {
    const form = new FormData()
    if (filename) {
      form.append("file", data, filename)
    } else {
      form.append("file", data)
    }
    const r = await this.client.post(`/projects/${this.client.projectID}/assets`, form)
    return asset(r.data)
  }

  /**
   * Update an asset.
   *
   * @param {string} id - ID of asset to update.
   * @param {any} data - Asset data to upload, typically a File or Blob.
   * @param {string} [filename] - Name of the file.
   * @returns Asset resource.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(id: string, data: any, filename?: string): Promise<Asset> {
    const form = new FormData()
    if (filename) {
      form.append("file", data, filename)
    } else {
      form.append("file", data)
    }
    const r = await this.client.patch(`/projects/${this.client.projectID}/assets/${id}`, form)
    return asset(r.data)
  }

  /**
   * Delete an asset.
   *
   * @param {string} id - ID of asset to delete.
   */
  async delete(id: string) {
    await this.client.delete(`/projects/${this.client.projectID}/assets/${id}`)
  }
}
module.exports = Assets
