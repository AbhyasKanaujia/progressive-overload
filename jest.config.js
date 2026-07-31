module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Only collect coverage from pure .ts files; .tsx JSX needs metro/babel
  collectCoverageFrom: [
    'db/**/*.ts',
    'hooks/**/*.ts',
    'store/**/*.ts',
    'types/**/*.ts',
    '!**/_layout.tsx',
    '!**/index.ts',
    '!**/*.test.ts',
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
