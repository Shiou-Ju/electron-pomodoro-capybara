const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/renderer/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'bundle.js',
    publicPath: './'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: 'src/renderer/index.html',
          to: path.resolve(__dirname, 'dist/renderer') 
        },
        { 
          from: 'public', 
          to: path.resolve(__dirname, 'dist/renderer'),
          globOptions: {
            ignore: ['**/*.png'] // 不要複製圖片
          }
        },
      ],
    }),
  ],
  watch: process.env.NODE_ENV === 'development',
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 1000,
    poll: false
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  performance: {
    hints: false // 關閉性能警告
  }
};
