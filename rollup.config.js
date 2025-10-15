// rollup.config.js
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import json from "@rollup/plugin-json"
import { readFileSync, existsSync } from "fs"
import path from "path"

// Read package.json manually to avoid issues with JSON imports
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

// Check if the processed data file exists
const dataFilePath = path.resolve("data", "zip-data.js")
if (!existsSync(dataFilePath)) {
  console.warn("Warning: zip-data.js not found in data directory.")
  console.warn("The build will proceed, but the library may not work correctly.")
  console.warn("Please run 'npm run process-data' to generate the data file first.")
}

export default [
  // ESM build
  {
    input: "src/index.ts",
    output: {
      file: pkg.module,
      format: "es",
      sourcemap: false,
      // We need to preserve the module structure for import resolution
      preserveModules: false
    },
    external: [],
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      typescript({ tsconfig: "./tsconfig.json" })
    ]
  },
  // CommonJS build
  {
    input: "src/index.ts",
    output: {
      file: pkg.main,
      format: "cjs",
      sourcemap: false,
      exports: "named",
      // Ensure correct resolution of imports
      preserveModules: false
    },
    external: [],
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      json(),
      typescript({ tsconfig: "./tsconfig.json" })
    ]
  },
  // UMD build (browser-friendly)
  {
    input: "src/index.ts",
    output: {
      name: "zipcodes",
      file: pkg.browser,
      format: "umd",
      sourcemap: false
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
