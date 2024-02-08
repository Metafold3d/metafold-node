# Metafold SDK for Node.js

[![npm](https://img.shields.io/npm/v/metafold.svg)](https://www.npmjs.org/package/metafold)

## Installation

```
# npm
npm install metafold

# yarn
yarn add metafold
```

## Usage

The SDK is compatible with both EMCAScript Modules (ESM) and CommonJS (legacy).

### ECMAScript Modules

```javascript
import MetafoldClient from "metafold"
```

### CommonJS

```javascript
const MetafoldClient = require("metafold")
```

### Example

```javascript
const accessToken = "..."
const projectID = "123"

const metafold = new MetafoldClient(accessToken, projectID)

assets = await metafold.assets.list()
console.log(assets[0].name)

asset = await metafold.assets.get("123")
console.log(asset.name)
```

Read the [documentation][] for more info or play around with one of the
[examples](examples).

[documentation]: https://Metafold3d.github.io/metafold-node/
