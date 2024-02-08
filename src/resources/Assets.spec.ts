import { strict as assert } from "assert"
import fs from "fs"
import nock from "nock"
import { Asset, AssetJSON } from "./Assets"
import MetafoldClient from "../metafold"

const defaultDate = new Date("Mon, 01 Jan 2024 00:00:00 GMT")

// Default sort order is descending by id
const assetList: AssetJSON[] = [
  {
    "id": "3",
    "filename": "2c7386e81b6d2ed4.bin",
    "size": 16777216,
    "checksum": "sha256:b5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "modified": "Mon, 01 Jan 2024 00:00:00 GMT",
  },
  {
    "id": "2",
    "filename": "f763df409e79eb1c.bin",
    "size": 16777216,
    "checksum": "sha256:6310a5951d58eb3e0fdd8c8767c606615552899e65019cb1582508a7c7bfec39",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "modified": "Mon, 01 Jan 2024 00:00:00 GMT",
  },
  {
    "id": "1",
    "filename": "f763df409e79eb1c.bin",
    "size": 16777216,
    "checksum": "sha256:6310a5951d58eb3e0fdd8c8767c606615552899e65019cb1582508a7c7bfec39",
    "created": "Mon, 01 Jan 2024 00:00:00 GMT",
    "modified": "Mon, 01 Jan 2024 00:00:00 GMT",
  },
]

const asset1: AssetJSON = {
  id: "1",
  filename: "f763df409e79eb1c.bin",
  size: 16777216,
  checksum: "sha256:6310a5951d58eb3e0fdd8c8767c606615552899e65019cb1582508a7c7bfec39",
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  modified: "Mon, 01 Jan 2024 00:00:00 GMT",
}

const newAsset: AssetJSON = {
  id: "1",
  filename: "test.png",
  size: 67,
  checksum: "sha256:089ad5bf4831b6758e9907db43bc5ebba2e9248a9929dad6132c49932e538278",
  created: "Mon, 01 Jan 2024 00:00:00 GMT",
  modified: "Mon, 01 Jan 2024 00:00:00 GMT",
}

describe("Assets", function() {
  const metafold = new MetafoldClient("testtoken", "1")

  nock("https://api.metafold3d.com", {
    reqheaders: { "Authorization": "Bearer testtoken" }
  })
    .get("/projects/1/assets")
      .reply(200, assetList)
    .get("/projects/1/assets")
      .query({ sort: "id:1" })
      .reply(200, assetList.slice().reverse())
    .get("/projects/1/assets")
      .query({ q: "filename:f763df409e79eb1c.bin" })
      .reply(200, assetList.slice().filter(
        (a: AssetJSON) => a.filename === "f763df409e79eb1c.bin"))
    .get("/projects/1/assets/1")
      .reply(200, asset1)
    .get("/projects/1/assets/1")
      .times(2)
      .query({ download: true })
      .reply(200, {
        ...asset1,
        link: "https://s3.com/f763df409e79eb1c.bin",
      })
    .get("/projects/1/assets/1")
      .query({
        download: true,
        filename: "foo.bin",
      })
      .reply(200, {
        ...asset1,
        link: "https://s3.com/f763df409e79eb1c.bin?filename=foo.bin",
      })
    .post("/projects/1/assets")
      .reply(201, newAsset)
    .patch("/projects/1/assets/1")
      .reply(200, newAsset)

  // Mock object storage
  nock("https://s3.com/")
    .get("/f763df409e79eb1c.bin")
    .reply(200, () => {
      return fs.createReadStream("test/test.png")
    })

  describe("#list()", function() {
    it("should retrieve asset for project 1", async function() {
      const assets = await metafold.assets.list()
      assert.deepEqual(assets.map((a: Asset) => a.id), ["3", "2", "1"])
    })
    it("should retrieve asset for project 1 sorted by id asc", async function() {
      const assets = await metafold.assets.list({ sort: "id:1" })
      assert.deepEqual(assets.map((a: Asset) => a.id), ["1", "2", "3"])
    })
    it("should retrieve asset for project 1 with a given filename", async function() {
      const assets = await metafold.assets.list({ q: "filename:f763df409e79eb1c.bin" })
      assert.ok(
        assets.every((a: Asset) => a.filename === "f763df409e79eb1c.bin"),
        "Asset.filename !== filename:f763df409e79eb1c.bin")
    })
  })

  describe("#get()", function() {
    it("should retrieve asset 1", async function() {
      const asset = await metafold.assets.get("1")
      assert.deepEqual(asset, {
        id: "1",
        filename: "f763df409e79eb1c.bin",
        size: 16777216,
        checksum: "sha256:6310a5951d58eb3e0fdd8c8767c606615552899e65019cb1582508a7c7bfec39",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#download()", function() {
    it("should download asset 1 as a stream", async function() {
      const r = await metafold.assets.download("1")
      // We could read PNG chunks as per this example:
      // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams#pipe_chains
      let size = 0
      for await (const chunk of r.data) {
        size += chunk.length
      }
      const want = fs.readFileSync("test/test.png")
      assert.equal(size, want.length)
    })
  })

  describe("#downloadURL()", function() {
    it("should retrieve a public download URL for asset 1", async function() {
      const url = await metafold.assets.downloadURL("1")
      assert.equal(url, "https://s3.com/f763df409e79eb1c.bin")
    })
    it("should retrieve a public download URL for asset 1 with a given filename", async function() {
      const url = await metafold.assets.downloadURL("1", { filename: "foo.bin" })
      assert.equal(url, "https://s3.com/f763df409e79eb1c.bin?filename=foo.bin")
    })
  })

  describe("#create()", function() {
    it("should upload and create an asset", async function() {
      const data = fs.readFileSync("test/test.png")
      const file = new File([data], "test.png", { type: "image/png" })
      const asset = await metafold.assets.create(file)
      assert.deepEqual(asset, {
        id: "1",
        filename: "test.png",
        size: 67,
        checksum: "sha256:089ad5bf4831b6758e9907db43bc5ebba2e9248a9929dad6132c49932e538278",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#update()", function() {
    it("should upload and update asset 1", async function() {
      const data = fs.readFileSync("test/test.png")
      const file = new Blob([data], { type: "image/png" })
      const asset = await metafold.assets.update("1", file, "test.png")
      assert.deepEqual(asset, {
        id: "1",
        filename: "test.png",
        size: 67,
        checksum: "sha256:089ad5bf4831b6758e9907db43bc5ebba2e9248a9929dad6132c49932e538278",
        created: defaultDate,
        modified: defaultDate,
      })
    })
  })

  describe("#delete()", function() {
    it("should delete asset 1", async function() {
      const scope = nock("https://api.metafold3d.com")
        .matchHeader("Authorization", "Bearer testtoken")
        .delete("/projects/1/assets/1")
        .reply(200, "OK")
      await metafold.assets.delete("1")
      assert.ok(scope.isDone(), "DELETE not called")
    })
  })
})
