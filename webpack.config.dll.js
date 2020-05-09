const path = require('path');
const DllPlugin = require('webpack/lib/DllPlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const pkg = require(process.cwd() + '/package.json');

module.exports = {
  // 入口文件
  entry: {
    // 项目中用到的依赖库文件
    vendor: [
      'vue/dist/vue.esm.js',
      'vue-router',
      'vuex',
      'axios',
      'vue-i18n',
      'element-ui'
    ]
  },
  // 输出文件
  output: {
    // 文件名称
    filename: '[name]_[hash].dll.js',
    // 将输出的文件放到dist目录下
    path: path.join(process.cwd(), 'public'),
    /*
     存放相关的dll文件的全局变量名称
    */
    library: '[name]_[hash]'
  },
  plugins: [
    // 使用插件 DllPlugin
    new DllPlugin({
      /*
       该插件的name属性值需要和 output.library保存一致，该字段值，也就是输出的 manifest.json文件中name字段的值。
       比如在jquery.manifest文件中有 name: jquery'
      */
      context: path.join(process.cwd(), 'public'), // 这个上下文必须必须同webpack.config.js中DllReferencePlugin插件的context所指向的上下文保持一致！！
      name: '[name]_[hash]',
      /* 生成manifest文件输出的位置和文件名称 */
      path: path.join(process.cwd(), 'public', '[name]_manifest.json')
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          output: {
            comments: false // 删除注释
          },
          compress: {
            drop_debugger: true, // 删除debugger
            drop_console: true // 删除console
          }
        }
      })
    ]
  }
};