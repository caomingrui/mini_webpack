const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, './build'),
        filename: 'build.js'
    },
    module: {
        rules: [
            {
                test: '.cmr',
                loader: path.join(__dirname, './pulgins/cmr_loader.js'),
            }
        ]
    },
    port: '8888'
};