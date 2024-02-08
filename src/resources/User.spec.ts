import { strict as assert } from "assert"
import nock from "nock"
import { Quota, Usage } from "./User"
import MetafoldClient from "../metafold"

const defaultDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT")

const wantQuota: Quota = {
  project: 10,
  import: 50,
  export: 50,
  simulation: 25,
}

const wantUsage: Usage = {
  project: 100,
  import: 500,
  export: 500,
  simulation: 250,
}

describe("User", function() {
  const metafold = new MetafoldClient("testtoken", "1")

  nock("https://api.metafold3d.com", {
    reqheaders: { "Authorization": "Bearer testtoken" }
  })
    .get("/user/license")
      .reply(200, {
        issued: "Mon, 01 Jan 2024 00:00:00 GMT",
        expires: "Mon, 01 Jan 2024 00:00:00 GMT",
        expired: false,
        product: "Pro",
      })
    .get("/user/quota")
      .reply(200, wantQuota)
    .get("/user/usage")
      .reply(200, wantUsage)

  describe("#license()", function() {
    it("should retrieve license info", async function() {
      const license = await metafold.user.license()
      assert.deepEqual(license, {
        issued: defaultDate,
        expires: defaultDate,
        expired: false,
        product: "Pro",
      })
    })
  })

  describe("#quota()", function() {
    it("should retrieve remaining quota", async function() {
      const quota = await metafold.user.quota()
      assert.deepEqual(quota, wantQuota)
    })
  })

  describe("#usage()", function() {
    it("should retrieve usage counts", async function() {
      const usage = await metafold.user.usage()
      assert.deepEqual(usage, wantUsage)
    })
  })
})
