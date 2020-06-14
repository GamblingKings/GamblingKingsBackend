module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@functions/(.*)$': '<rootDir>/src/functions/$1',
    '@module/(.*)$': '<rootDir>/src/module/$1',
    '@utils/(.*)$': '<rootDir>/src/utils/$1',
    '@models/(.*)$': '<rootDir>/src/models/$1',
  },
  setupFilesAfterEnv: ['./jest.setup.js', 'jest-extended'],
  preset: 'jest-dynalite',
};
