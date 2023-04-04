module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', {
            configFile: 'tsconfig.json',
            sourceMap: true,
        }],
    },
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],
};
