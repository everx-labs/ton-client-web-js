module.exports = {
    moduleFileExtensions: [
        'js',
    ],
    modulePathIgnorePatterns: [
        'init-tests.js',
    ],
    preset: 'jest-puppeteer',
    globals: {
        PATH: "http://localhost:4000"
    },
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
    ],
};
