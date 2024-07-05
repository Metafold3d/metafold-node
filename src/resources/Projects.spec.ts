import { strict as assert } from "assert"
import nock from "nock"
import MetafoldClient from "../metafold.js"
import type { Access, Project, ProjectJSON } from "./Projects.js"

const defaultDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT")

// Default sort order is descending by id
const projectList: ProjectJSON[] = [
  {
    "id": "3",
    "user": "1",
    "name": "Foo",
    "access": "public",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "modified": "Mon, 01 Jan 2024 00:00:00 GMT",
  },
  {
    "id": "2",
    "user": "1",
    "name": "My Project",
    "access": "private",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "modified": "Mon, 01 Jan 2024 00:00:00 GMT",
  },
  {
    "id": "1",
    "user": "1",
    "name": "My Project",
    "access": "private",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "modified": "Mon, 01 Jan 2024 00:00:00 GMT",
  },
]

const project1: ProjectJSON = {
  id: "1",
  user: "1",
  name: "My Project",
  access: "private",
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  modified: "Mon, 01 Jan 2024 00:00:00 GMT",
}

const newProject: ProjectJSON = {
  id: "1",
  user: "1",
  name: "New Project",
  access: "public",
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  modified: "Mon, 01 Jan 2024 00:00:00 GMT",
}

describe("Projects", function() {
  const metafold = new MetafoldClient("testtoken")

  nock("https://api.metafold3d.com", {
    reqheaders: { "Authorization": "Bearer testtoken" }
  })
    .get("/projects")
      .reply(200, projectList)
    .get("/projects")
      .query({ sort: "id:1" })
      .reply(200, projectList.slice().reverse())
    .get("/projects")
      .query({ q: 'name:"My Project"' })
      .reply(200, projectList.slice().filter(
        (a: ProjectJSON) => a.name === "My Project"))
    .get("/projects/1")
      .reply(200, project1)
    .post("/projects")
      .reply(201, newProject)
    .post("/projects")
      .reply(201, { ...newProject, id: "2" })
    .patch("/projects/1")
      .reply(200, newProject)

  describe("#list()", function() {
    it("should retrieve projects", async function() {
      const projects = await metafold.projects.list()
      assert.deepEqual(projects.map((p: Project) => p.id), ["3", "2", "1"])
    })
    it("should retrieve projects sorted by id asc", async function() {
      const projects = await metafold.projects.list({ sort: "id:1" })
      assert.deepEqual(projects.map((p: Project) => p.id), ["1", "2", "3"])
    })
    it("should retrieve projects with a given name", async function() {
      const projects = await metafold.projects.list({ q: 'name:"My Project"' })
      assert.ok(
        projects.every((p: Project) => p.name === "My Project"),
        'Project.name !== name:"My Project"')
    })
  })

  describe("#get()", function() {
    it("should retrieve project 1", async function() {
      const project = await metafold.projects.get("1")
      assert.deepEqual(project, {
        id: "1",
        user: "1",
        name: "My Project",
        access: "private",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#create()", function() {
    it("should create a project", async function() {
      const project = await metafold.projects.create("New Project", "public")
      assert.deepEqual(project, {
        id: "1",
        user: "1",
        name: "New Project",
        access: "public",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#duplicate()", function() {
    it("should duplicate project 1", async function() {
      const project = await metafold.projects.duplicate("1", "New Project", "public")
      assert.deepEqual(project, {
        id: "2",
        user: "1",
        name: "New Project",
        access: "public",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#update()", function() {
    it("should update project 1", async function() {
      const params = { name: "New Project", access: "public" as Access }
      const project = await metafold.projects.update("1", params)
      assert.deepEqual(project, {
        id: "1",
        user: "1",
        name: "New Project",
        access: "public",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#delete()", function() {
    it("should delete project 1", async function() {
      const scope = nock("https://api.metafold3d.com")
        .matchHeader("Authorization", "Bearer testtoken")
        .delete("/projects/1")
        .reply(200, "OK")
      await metafold.projects.delete("1")
      assert.ok(scope.isDone(), "DELETE not called")
    })
  })
})
