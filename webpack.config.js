const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: [
        './server.ts'
    ],
    mode: 'development',

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },

    devServer: {
        contentBase: path.resolve(__dirname, 'public')
    },

    target: 'node',
    externals: [nodeExternals()],
    watch: true,
    module: {
        rules: [
            {
                test: '/\.js?$/',
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },

    resolve: {
        extensions: ['.js', '.ts']
    },
};
