module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/GoHabit-system/backend/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
};