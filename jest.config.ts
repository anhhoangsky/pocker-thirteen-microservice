import type { Config } from 'jest';

const config: Config = {
	moduleFileExtensions: ['js', 'json', 'ts'],
	rootDir: '.',
	testRegex: '.*\\.spec\\.ts$',
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest'
	},
	collectCoverageFrom: ['**/*.(t|j)s'],
	coverageDirectory: './coverage',
	testEnvironment: 'node',
	roots: ['<rootDir>/apps/', '<rootDir>/test/'],
	moduleNameMapper: {
		'^@app/(.*)$': '<rootDir>/apps/$1',
		'^@test/(.*)$': '<rootDir>/test/$1'
	}
};

export default config;
