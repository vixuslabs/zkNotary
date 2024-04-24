/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  rootDir: '.',
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  testTimeout: 1_000_000,
  transform: {
    '^.+\\.(t)s$': 'ts-jest',
    '^.+\\.(j)s$': 'babel-jest',
  },
  resolver: '<rootDir>/jest-resolver.cjs',
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(tslib|o1js/node_modules/tslib))',
  ],
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  moduleNameMapper: {
    '^(\\.{1,2}/.+)\\.js$': '$1',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
};

// export default {
//   verbose: true,
//   preset: 'ts-jest/presets/default-esm',
//   testEnvironment: 'node',
//   globals: {
//     'ts-jest': {
//       useESM: true,
//     },
//   },
//   testTimeout: 1_000_000,
//   transform: {
//     '^.+\\.(t)s$': 'ts-jest',
//     '^.+\\.(j)s$': 'babel-jest',
//   },
//   resolver: '<rootDir>/jest-resolver.cjs',
//   transformIgnorePatterns: [
//     '<rootDir>/node_modules/(?!(tslib|o1js/node_modules/tslib))',
//   ],
//   modulePathIgnorePatterns: ['<rootDir>/build/'],
//   moduleNameMapper: {
//     '^(\\.{1,2}/.+)\\.js$': '$1',
//   },
// };
