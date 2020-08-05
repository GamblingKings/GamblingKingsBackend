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

    // Get coverage from
    'src/dynamodb/**/*.ts',
    'src/games/**/*.ts',
    'src/models/**/*.ts',
    'src/enums/**/*.ts',
    'src/types/**/*.ts',
    'src/utils/**/*.ts',

    // Ignore coverage from
    '!src/functions/**/*.ts',
    '!src/websocket/broadcast/**/*.ts',
    '!src/dynamodb/**/db.ts',
  ],
  setupFilesAfterEnv: ['./jest.setup.js', 'jest-extended'],
  preset: 'jest-dynalite',
};
