// rollup.config.js
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"
import { readFileSync } from "fs"

// Read package.json manually to avoid issues with JSON imports
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

export default [
  // ESM build
  {
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "es",
      sourcemap: true
    },
    external: ["fs", "path", "url"],
    plugins: [resolve({ preferBuiltins: true }), commonjs(), json(), typescript({ tsconfig: "./tsconfig.json" })]
  },
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
      exports: "named"
    },
    external: ["fs", "path", "url"],
    plugins: [resolve({ preferBuiltins: true }), commonjs(), json(), typescript({ tsconfig: "./tsconfig.json" })]
  },
  // UMD build (browser-friendly)
  {
    input: "src/index.ts",
    output: {
      name: "zipcodes",
      file: pkg.browser,
      format: "umd",
      sourcemap: true,
      globals: {
        fs: "fs",
        path: "path",
        url: "url"
      }
    },
    plugins: [
      resolve({
        preferBuiltins: true,
        browser: true
      }),
      commonjs(),
      json(),
      typescript({ tsconfig: "./tsconfig.json" }),
      terser()
    ]
  }
]
