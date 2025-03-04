export default {
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true
      }
    ]
  },
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["**/src/test/**/*.test.(ts|js)"],
  moduleFileExtensions: ["ts", "js", "json"],
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  transformIgnorePatterns: ["/node_modules/(?!(.+))"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"]
}
