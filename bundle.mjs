import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["lib/metafold.js"],
  format: "esm",
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: "dist/metafold.min.js",
})
