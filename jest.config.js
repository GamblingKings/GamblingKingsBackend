module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@functions/(.*)$': '<rootDir>/src/functions/$1',
    '@dynamodb/(.*)$': '<rootDir>/src/dynamodb/$1',
    '@games/(.*)$': '<rootDir>/src/games/$1',
    '@utils/(.*)$': '<rootDir>/src/utils/$1',
    '@models/(.*)$': '<rootDir>/src/models/$1',
    '@types/(.*)$': '<rootDir>/src/types/$1',
    '@websocket/(.*)$': '<rootDir>/src/websocket/$1',
  },
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
