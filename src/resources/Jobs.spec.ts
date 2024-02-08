import { strict as assert } from "assert"
import nock from "nock"
import { Asset, AssetJSON } from "./Assets"
import { Job, JobJSON } from "./Jobs"
import MetafoldClient from "../metafold"

const defaultDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT")

const assetJSON: AssetJSON = {
  id: "1",
  filename: "f763df409e79eb1c.bin",
  size: 16777216,
  checksum: "sha256:6310a5951d58eb3e0fdd8c8767c606615552899e65019cb1582508a7c7bfec39",
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  modified: "Mon, 01 Jan 2024 00:00:00 GMT",
}

const asset: Asset = {
  id: "1",
  filename: "f763df409e79eb1c.bin",
  size: 16777216,
  checksum: "sha256:6310a5951d58eb3e0fdd8c8767c606615552899e65019cb1582508a7c7bfec39",
  created: defaultDate,
  modified: defaultDate,
}

// Default sort order is descending by id
const jobList: JobJSON[] = [
  {
    "id": "3",
    "name": "bar",
    "type": "evaluate_graph",
    "parameters": {
      "graph": null,
    },
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "state": "success",
    "assets": [assetJSON],
    "meta": null,
  },
  {
    "id": "2",
    "name": "foo",
    "type": "evaluate_graph",
    "parameters": {
      "graph": null,
    },
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "state": "success",
    "assets": [assetJSON],
    "meta": null,
  },
  {
    "id": "1",
    "name": "foo",
    "type": "evaluate_graph",
    "parameters": {
      "graph": null,
    },
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "state": "success",
    "assets": [assetJSON],
    "meta": null,
  },
]

const newJob: JobJSON = {
  id: "1",
  name: "My Job",
  type: "test_job",
  parameters: {
    foo: 1,
    bar: "a",
    baz: [2, "b"],
  },
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  state: "pending",
  assets: [],
  meta: null,
}

describe("Jobs", function() {
  const metafold = new MetafoldClient("testtoken", "1")

  nock("https://api.metafold3d.com", {
    reqheaders: { "Authorization": "Bearer testtoken" }
  })
    .get("/projects/1/jobs")
      .reply(200, jobList)
    .get("/projects/1/jobs")
      .query({ sort: "id:1" })
      .reply(200, jobList.slice().reverse())
    .get("/projects/1/jobs")
      .query({ q: "name:foo" })
      .reply(200, jobList.slice().filter(
        (j: JobJSON) => j.name === "foo"))
    .get("/projects/1/jobs/1")
      .reply(200, jobList[jobList.length - 1])
    // Job success
    .post("/projects/1/jobs")
      .reply(202, {
        ...newJob,
        link: "https://api.metafold3d.com/projects/1/jobs/1/status",
      })
    .get("/projects/1/jobs/1/status")
      .times(2)
      .reply(202, {
        ...newJob,
        state: "started",
      })
    .get("/projects/1/jobs/1/status")
      .reply(201, {
        ...newJob,
        state: "success",
        assets: [assetJSON],
      })
    // Job failure
    .post("/projects/1/jobs")
      .reply(202, {
        ...newJob,
        link: "https://api.metafold3d.com/projects/1/jobs/1/status",
      })
    .get("/projects/1/jobs/1/status")
      .reply(400, { msg: "Bad request" })
    .patch("/projects/1/jobs/1", { name: "baz" })
      .reply(200, {
        ...jobList[jobList.length - 1],
        name: "baz",
      })

  describe("#list()", function() {
    it("should retrieve job for project 1", async function() {
      const jobs = await metafold.jobs.list()
      assert.deepEqual(jobs.map((j: Job) => j.id), ["3", "2", "1"])
    })
    it("should retrieve job for project 1 sorted by id asc", async function() {
      const jobs = await metafold.jobs.list({ sort: "id:1" })
      assert.deepEqual(jobs.map((j: Job) => j.id), ["1", "2", "3"])
    })
    it("should retrieve job for project 1 with a given name", async function() {
      const jobs = await metafold.jobs.list({ q: "name:foo" })
      assert.ok(
        jobs.every((j: Job) => j.name === "foo"),
        "Job.name !== name:foo")
    })
  })

  describe("#get()", function() {
    it("should retrieve job 1", async function() {
      const job = await metafold.jobs.get("1")
      assert.deepEqual(job, {
        id: "1",
        name: "foo",
        type: "evaluate_graph",
        parameters: {
          graph: null,
        },
        created: defaultDate,
        state: "success",
        assets: [asset],
        "meta": null,
      })
    })
  })

  describe("#run()", function() {
    it("should dispatch a job and wait for success", async function() {
      this.timeout(1000 * 5) // 5 secs

      const params = {
        foo: 1,
        bar: "a",
        baz: [2, "b"],
      }
      const job = await metafold.jobs.run("test_job", params, "My Job")
      assert.deepEqual(job, {
        id: "1",
        name: "My Job",
        type: "test_job",
        parameters: params,
        created: defaultDate,
        state: "success",
        assets: [asset],
        "meta": null,
      })
    })
    it("should dispatch a job and throw an error on failure", async function() {
      await assert.rejects(
        metafold.jobs.run("test_job", {}, "My Job"),
        /^Error: Bad request$/,
      )
    })
    it("should dispatch a job and throw an error on timeout", async function() {
      const scope = nock("https://api.metafold3d.com")
        .matchHeader("Authorization", "Bearer testtoken")
        .post("/projects/1/jobs")
          .reply(202, {
            ...newJob,
            link: "https://api.metafold3d.com/projects/1/jobs/1/status",
          })
        .get("/projects/1/jobs/1/status")
          .reply(202, {
            ...newJob,
            state: "started",
          })

      // Simulate timeout after polling status once.
      // FIXME(ryan): Since this is all time-based this test may be a little flakey.
      await assert.rejects(
        metafold.jobs.run("test_job", {}, "My Job", 1500),
        /Job 'My Job' failed to complete within 1500 ms/,
      )
      assert.ok(scope.isDone(), "GET /projects/1/jobs/1/status not called")
    })
  })

  describe("#update()", function() {
    it("should update job 1", async function() {
      const job = await metafold.jobs.update("1", { name: "baz" })
      assert.equal(job.name, "baz")
    })
  })
})
