module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/GoHabit-system/backend/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/GoHabit-system/backend/tsconfig.json',
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/GoHabit-system/backend/src/$1',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
};