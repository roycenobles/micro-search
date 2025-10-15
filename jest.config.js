export default {
	preset: "ts-jest/presets/default-esm",
	extensionsToTreatAsEsm: [".ts"],
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				useESM: true
			}
		]
	},
	moduleNameMapper: {
		"^(\\..*/.*)\\.js$": "$1"
	},
	transformIgnorePatterns: ["node_modules/(?!(search-index)/)"],
	collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/**/*.spec.ts", "!src/**/*.test.ts", "!src/example.ts"],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"]
};
