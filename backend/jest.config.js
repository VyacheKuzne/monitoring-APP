"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    roots: ['<rootDir>/test/test'],
    testMatch: ['**/*.spec.ts'],
    preset: 'ts-jest',
    testEnvironment: 'node',
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map