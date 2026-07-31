module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'db/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'store/**/*.{ts,tsx}',
    'types/**/*.{ts,tsx}',
    '!**/_layout.tsx',
    '!**/index.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.d.ts',
  ],
  // TODO: raise thresholds after issue #1 is merged and real tests are added
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.expo/'],
};
