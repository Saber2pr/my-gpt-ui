require('dotenv').config()

const { spawn } = require('child_process')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const webpack = require('webpack')

const publicPath = (resourcePath, context) =>
  path.relative(path.dirname(resourcePath), context) + '/'

// 这里写cdn地址，如果静态资源有上传的话
const cdn = '/ai-assistant'

let serverProcess = null

/**
 * @type {webpack.Configuration}
 */
module.exports = {
  entry: './src/app.tsx',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  output: {
    filename: '[name].[hash].min.js',
    path: path.join(__dirname, 'build'),
    publicPath: process.env.NODE_ENV === 'production' ? cdn : '/',
  },
  devServer: {
    onBeforeSetupMiddleware() {
      if (!serverProcess) {
        console.log('🚀 启动本地 Node.js 服务器...')
        serverProcess = spawn('node', ['server.js'], {
          stdio: 'inherit', // 让 Node.js 服务器的日志显示在终端
          shell: true,
        })

        serverProcess.on('close', (code) => {
          console.log(`Node.js 服务器进程退出，退出码：${code}`)
          serverProcess = null
        })
      }
    },
  },
  module: {
    rules: [
      // 使用babel编译js、jsx、ts、tsx
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: ['babel-loader'],
      },
      // 图片url处理
      {
        test: /\.(woff|svg|eot|ttf|png)$/,
        use: ['url-loader'],
      },
      // css、less编译
      {
        test: /\.(css|less)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { publicPath },
          },
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    // index.html模板设置
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'template.html'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: 'style.[id][hash].css',
    }),
    // webpack编译进度
    new webpack.ProgressPlugin(),
  ],
  watchOptions: {
    aggregateTimeout: 1000,
    ignored: /node_modules|lib/,
  },
  // 代码分割
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    },
  },
}
