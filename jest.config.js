module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: './coverage/',
  collectCoverageFrom: [
    // Get full coverage
    // 'src/**/*.ts',

    // Get coverage
    'src/dynamodb/**/*.ts',
    'src/games/**/*.ts',
    'src/models/**/*.ts',
    'src/types/**/*.ts',
    'src/utils/**/*.ts',

    // Ignored coverage
    '!src/functions/**/*.ts',
    '!src/websocket/broadcast/**/*.ts',
  ],
  setupFilesAfterEnv: ['./jest.setup.js', 'jest-extended'],
  preset: 'jest-dynalite',
};
