import * as esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["src/metafold.ts"],
  format: "esm",
  bundle: true,
  minify: true,
  sourcemap: true,
  outfile: "dist/metafold.min.js",
})
