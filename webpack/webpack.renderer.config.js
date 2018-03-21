const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const __DEV__ = process.env.NODE_ENV !== 'production';

const extractSCSS = new ExtractTextPlugin(`css/main.css?${__DEV__ ? '' : '[contenthash:8]'}`);
const extractCSS = new ExtractTextPlugin(`css/plugins.css?${__DEV__ ? '' : '[contenthash:8]'}`);

let config = {
  entry: {
    app: path.resolve(__dirname, '../src/renderer/index.js'),
    vendors: [ 'vue', 'xlsx', 'file-saver', 'lodash' ]
  },
  output: {
    path: path.resolve(__dirname, '../dist/'),
    filename: `js/[name].js${__DEV__ ? '' : '[chunkhash:8]'}`
  },
  devtool: __DEV__ ? 'source-map' : '',
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: false,
            loaders: {
              scss: 'vue-style-loader!css-loader!sass-loader'
            },
          }
        }
      },
      {
        test: /\.scss$/,
        use: extractSCSS.extract({
          use: [
            {
              loader: 'css-loader',
              options: { minimize: !__DEV__ }
            },
            { loader: 'sass-loader' }
          ]
        })
      },
      {
        test: /\.css$/,
        use: extractCSS.extract({
          use: [{
            loader: 'css-loader',
            options: { minimize: !__DEV__ }
          }]
        })
      },
      {
        test: /\.(png|gif|jpg|svg|ttf|woff|woff2|otf|eot)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'assets/',
            publicPath: '../../../'
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, '../src/renderer'),
    },
    extensions: ['.js', '.vue', '.json', '.scss' ]
  },
  node: {
    __dirname: __DEV__,
    __filename: __DEV__
  },
  plugins: [
    new WebpackMd5Hash(),
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendors'],
      filename: `js/[name].js?${__DEV__ ? '' : '[chunkhash:8]'}`
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/index.html'),
      updated_at: new Date()
    }),
    new webpack.DefinePlugin({
      __DEV__: __DEV__
    }),
    extractCSS,
    extractSCSS,
  ]
};

if (!__DEV__) {
  config.plugins.push(
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'}),
    new webpack.optimize.UglifyJsPlugin({parallel: true})
  );
} else {
  config.plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );
}

module.exports = config;
