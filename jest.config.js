module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: {
          ignoreCodes: [151002],
        },
        isolatedModules: true,
      },
    ],
  },
  globals: {
    "ts-jest": {
      isolatedModules: true,
      diagnostics: {
        ignoreCodes: [151002],
      },
    },
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/migrations/**",
    "!src/database/seed*.ts",
    "!src/database/seeds/**",
    "!src/types/**",
    "!src/enums/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  testTimeout: 10000,
  verbose: true,
};
