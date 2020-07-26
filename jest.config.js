module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: './coverage/',
  collectCoverageFrom: [
    // Get full coverage
    // 'src/**/*.ts',

    // Ignore coverage for lambda functions / websocket for now
    // 'src/functions/**/*.ts',
    // 'src/websocket/**/*.ts',

    'src/dynamodb/**/*.ts',
    'src/games/**/*.ts',
    'src/models/**/*.ts',
    'src/types/**/*.ts',
    'src/utils/**/*.ts',
  ],
  setupFilesAfterEnv: ['./jest.setup.js', 'jest-extended'],
  preset: 'jest-dynalite',
};
