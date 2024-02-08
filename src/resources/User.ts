import type { Client } from "../client"

export type LicenseJSON = {
  /** License issue (RFC 1123) datetime. */
  issued: string
  /** License expiry (RFC 1123) datetime. */
  expires: string
  /** Whether license has expired. */
  expired: boolean
  /** Name of the license tier. */
  product: string
}

/** License information. */
export type License = {
  /** License issue datetime. */
  issued: Date
  /** License expiry datetime. */
  expires: Date
  /** Whether license has expired. */
  expired: boolean
  /** Name of the license tier. */
  product: string
}

/** Remaining usage counts. */
export type Quota = {
  /** Number of projects. */
  project: number
  /** Number of asset imports. */
  import: number
  /** Number of export jobs. */
  export: number
  /** Number of simulation jobs. */
  simulation: number
}

/** Lifetime usage counts. */
export type Usage = Quota

/** Metafold user endpoint. */
class User {
  constructor(private client: Client) {
  }

  /** Get license information. */
  async license(): Promise<License> {
    const r = await this.client.get("/user/license")
    const { issued, expires, expired, product }: LicenseJSON = r.data
    return {
      issued: new Date(issued),
      expires: new Date(expires),
      expired,
      product,
    }
  }

  /** Get remaining quota. */
  async quota(): Promise<Quota> {
    const r = await this.client.get("/user/quota")
    return r.data
  }

  /** Get lifetime usage counts. */
  async usage(): Promise<Usage> {
    const r = await this.client.get("/user/usage")
    return r.data
  }
}
module.exports = User
