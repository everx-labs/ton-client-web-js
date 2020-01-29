module.exports = {
    presets: [
        '@babel/preset-flow',
    ],
    plugins: [
        ['@babel/plugin-transform-flow-strip-types'],
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
    sourceType: "unambiguous"
};
