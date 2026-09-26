// rollup.config.js
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import terser from "@rollup/plugin-terser"
import { readFileSync } from "fs"

// Read package.json manually to avoid issues with JSON imports
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

export default [
  // ESM + CommonJS builds
  {
    input: "src/index.ts",
    output: [
      { file: pkg.module, format: "es" },
      { file: pkg.main, format: "cjs", exports: "named" }
    ],
    plugins: [resolve({ preferBuiltins: true }), commonjs(), typescript({ tsconfig: "./tsconfig.json" })]
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
      typescript({ tsconfig: "./tsconfig.json" }),
      terser()
    ]
  }
]
