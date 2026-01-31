#!/usr/bin/env bun
import tailwind from "bun-plugin-tailwind";

await Bun.build({
  entrypoints: ["./src/index.html"],
  outdir: "./dist",
  minify: true,
  plugins: [tailwind],
});
