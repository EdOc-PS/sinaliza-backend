// Testes unitários do back. Rodar a partir de sinaliza-backend:
//   npx jest --config src/teste/jest.config.js
const path = require('path');

const root = path.resolve(__dirname, '../..');

module.exports = {
  rootDir: root,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: 'src/teste/unit/.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { diagnostics: false }],
  },
  // Mesmos atalhos do tsconfig.json
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@swagger/(.*)$': '<rootDir>/src/common/swagger/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
