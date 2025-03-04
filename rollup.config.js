import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import json from "@rollup/plugin-json"
import terser from "@rollup/plugin-terser"

export default [
  // CommonJS build (for Node.js)
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true
    },
    external: ["fs", "path"],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist"
      }),
      nodeResolve(),
      commonjs(),
      json()
    ]
  },

  // ES module build (for bundlers)
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      sourcemap: true
    },
    external: ["fs", "path"],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json"
      }),
      nodeResolve(),
      commonjs(),
      json()
    ]
  },

  // UMD build (for browsers)
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.umd.js",
      format: "umd",
      name: "ZipCodesUS",
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json"
      }),
      nodeResolve({
        browser: true
      }),
      commonjs(),
      json(),
      terser()
    ]
  },

  // Minified UMD build
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.umd.min.js",
      format: "umd",
      name: "ZipCodesUS",
      sourcemap: true
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json"
      }),
      nodeResolve({
        browser: true
      }),
      commonjs(),
      json(),
      terser()
    ]
  }
]
