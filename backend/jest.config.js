module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/types/**',
    '!src/config/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 55,
      lines: 60,
    },
  },
  projects: [
    {
      preset: 'ts-jest',
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json',
        }],
      },
    },
    {
      preset: 'ts-jest',
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.test.json',
        }],
      },
    },
  ],
};
