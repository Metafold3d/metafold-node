import { strict as assert } from "assert"
import nock from "nock"
import MetafoldClient from "../metafold.js"
import type { Workflow, WorkflowJSON } from "./Workflows.js"

const defaultDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT")

// Default sort order is descending by id
const workflowList: WorkflowJSON[] = [
  {
    "id": "3",
    "jobs": ["1", "2"],
    "state": "success",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "started": "Mon, 01 Jan 2024 00:00:00 GMT",
    "finished": "Mon, 01 Jan 2024 00:00:00 GMT",
    "definition": "...",
    "project_id": "1",
  },
  {
    "id": "2",
    "jobs": ["1", "2"],
    "state": "started",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "started": "Mon, 01 Jan 2024 00:00:00 GMT",
    "finished": "Mon, 01 Jan 2024 00:00:00 GMT",
    "definition": "...",
    "project_id": "1",
  },
  {
    "id": "1",
    "jobs": ["1", "2"],
    "state": "success",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "started": "Mon, 01 Jan 2024 00:00:00 GMT",
    "finished": "Mon, 01 Jan 2024 00:00:00 GMT",
    "definition": "...",
    "project_id": "1",
  },
]

const newWorkflow: WorkflowJSON = {
  id: "1",
  jobs: ["1", "2"],
  state: "success",
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  started: "Mon, 01 Jan 2024 00:00:00 GMT",
  finished: "Mon, 01 Jan 2024 00:00:00 GMT",
  definition: "foo",
  project_id: "1",
}

describe("Workflows", function() {
  const metafold = new MetafoldClient("testtoken", "1")

  nock("https://api.metafold3d.com", {
    reqheaders: { "Authorization": "Bearer testtoken" }
  })
    .get("/projects/1/workflows")
      .reply(200, workflowList)
    .get("/projects/1/workflows")
      .query({ sort: "id:1" })
      .reply(200, workflowList.slice().reverse())
    .get("/projects/1/workflows")
      .query({ q: "state:started" })
      .reply(200, workflowList.slice().filter(
        (w: WorkflowJSON) => w.state === "started"))
    .get("/projects/1/workflows/1")
      .reply(200, workflowList[workflowList.length - 1])
    // Workflow success
    .post("/projects/1/workflows")
      .reply(202, {
        ...newWorkflow,
        link: "https://api.metafold3d.com/projects/1/workflows/1/status",
      })
    .get("/projects/1/workflows/1/status")
      .times(2)
      .reply(202, {
        ...newWorkflow,
        state: "started",
      })
    .get("/projects/1/workflows/1/status")
      .reply(201, {
        ...newWorkflow,
        state: "success",
      })
    // Workflow failure
    .post("/projects/1/workflows")
      .reply(202, {
        ...newWorkflow,
        link: "https://api.metafold3d.com/projects/1/workflows/1/status",
      })
    .get("/projects/1/workflows/1/status")
      .reply(400, { msg: "Bad request" })

  describe("#list()", function() {
    it("should retrieve workflow for project 1", async function() {
      const workflows = await metafold.workflows.list()
      assert.deepEqual(workflows.map((w: Workflow) => w.id), ["3", "2", "1"])
    })
    it("should retrieve workflow for project 1 sorted by id asc", async function() {
      const workflows = await metafold.workflows.list({ sort: "id:1" })
      assert.deepEqual(workflows.map((w: Workflow) => w.id), ["1", "2", "3"])
    })
    it("should retrieve workflow for project 1 with a given state", async function() {
      const workflows = await metafold.workflows.list({ q: "state:started" })
      assert.ok(
        workflows.every((w: Workflow) => w.state === "started"),
        "Workflow.state !== state:started")
    })
  })

  describe("#get()", function() {
    it("should retrieve workflow 1", async function() {
      const workflow = await metafold.workflows.get("1")
      assert.deepEqual(workflow, {
        id: "1",
        jobs: ["1", "2"],
        state: "success",
        created: defaultDate,
        started: defaultDate,
        finished: defaultDate,
        definition: "...",
        project_id: "1",
      })
    })
  })

  describe("#run()", function() {
    it("should dispatch a workflow and wait for success", async function() {
      this.timeout(1000 * 8) // 8 secs

      const definition = "foo"
      const workflow = await metafold.workflows.run(definition)
      assert.deepEqual(workflow, {
        id: "1",
        jobs: ["1", "2"],
        state: "success",
        created: defaultDate,
        started: defaultDate,
        finished: defaultDate,
        definition: "foo",
        project_id: "1",
      })
    })
    it("should dispatch a workflow and throw an error on failure", async function() {
      this.timeout(1000 * 3) // 3 secs
      await assert.rejects(
        metafold.workflows.run("foo"),
        /^Error: Bad request$/,
      )
    })
    it("should dispatch a workflow and throw an error on timeout", async function() {
      this.timeout(1000 * 3) // 3 secs
      const scope = nock("https://api.metafold3d.com")
        .matchHeader("Authorization", "Bearer testtoken")
        .post("/projects/1/workflows")
          .reply(202, {
            ...newWorkflow,
            link: "https://api.metafold3d.com/projects/1/workflows/1/status",
          })
        .get("/projects/1/workflows/1/status")
          .reply(202, {
            ...newWorkflow,
            state: "started",
          })

      // Simulate timeout after polling status once.
      // FIXME(ryan): Since this is all time-based this test may be a little flakey.
      await assert.rejects(
        metafold.workflows.run("foo", {}, {}, 2500),
        /Workflow failed to complete within 2500 ms/,
      )
      assert.ok(scope.isDone(), "GET /projects/1/workflows/1/status not called")
    })
  })

  describe("#delete()", function() {
    it("should delete workflow 1", async function() {
      const scope = nock("https://api.metafold3d.com")
        .matchHeader("Authorization", "Bearer testtoken")
        .delete("/projects/1/workflows/1")
        .reply(200, "OK")
      await metafold.workflows.delete("1")
      assert.ok(scope.isDone(), "DELETE not called")
    })
  })
})
