const path = require('path');
const webpack = require('webpack');

const __DEV__ = process.env.NODE_ENV !== 'production';

let config = {
  entry: {
    main: path.resolve(__dirname, '../src/main/main.js')
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'main.js',
  },
  devtool: __DEV__ ? 'source-map' : '',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.node$/,
        use: {
          loader: 'node-loader'
        }
      }
    ]
  },
  node: {
    __dirname: __DEV__,
    __dirname: __DEV__
  },
  target: 'electron-main',
  plugins: []
};

if (!__DEV__) {
  config.plugins.push(
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
    new webpack.optimize.UglifyJsPlugin()
  )
}

module.exports = config;
