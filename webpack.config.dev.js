const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const devServerConf = require(process.cwd() + '/config/dev-server');
const globalVar = require(process.cwd() + '/config/globalVar');
const DllReferencePlugin = require('webpack/lib/DllReferencePlugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HappyPack = require('./happyPack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const devMode = process.env.NODE_ENV === 'dev';
function resolve(dir) {
    return path.join(process.cwd(), dir);
};

const config = {
    devtool: devMode ? 'eval-source-map' : 'cheap-module-source-map',
    mode: devMode ? 'development' : 'production',
    entry: {
        main: resolve('/src/app.js')
    },
    output: {
        filename: 'js/[name]_[hash].js',// 入口文件输出名（eg:main.js）
        path: resolve('/dist/assets/'),
        publicPath: devMode ? '/' : '/assets/',
        chunkFilename: 'js/[name]_[chunkhash].js', // 此选项决定了非入口(non-entry)chunk文件的名称 配合懒加载打包重命名
        library: '[name]_library'
    },
    module: {
        rules: [{
            test: /\.(js|vue)$/,
            use: ['happypack/loader?id=eslint'],
            enforce: 'pre', // 为了安全起见，您可以使用enforce: "pre"section检查源文件，而不是由其他加载器修改（如babel-loader）
            include: [resolve('/src')]
        }, {
            test: /\.(js|jsx)$/,
            use: ['happypack/loader?id=babel'],
            include: [resolve('/src'), resolve('/node_modules/element-ui/src/utils/'), resolve('/node_modules/@superchao/super')] // 表示哪些目录中的 .js 文件需要进行 babel-loader
        }, {
            test: /\.css$/,
            // 编译Sass文件 提取CSS文件 把css从js中提取出来 ExtractTextPlugin 适用于webpack@3.0
            // use: ExtractTextPlugin.extract({
            //     // 如果配置成不提取，则此类文件使用style-loader插入到<head>标签中
            //     fallback: 'style-loader',
            //     use: 'HappyPack/loader?id=css'
            // })

            /**
             *  MiniCssExtractPlugin 适用于webpack@4.0+
             * 开发环境不抽离css
             * */
            use: [
                devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                'happypack/loader?id=css'
            ]
        }, {
            test: /\.scss$/,
            // 编译Sass文件 提取CSS文件 把css从js中提取出来 
            // 使用happypack需使用此操作提取 不然会报错
            // use: ExtractTextPlugin.extract({
            //     // 如果配置成不提取，则此类文件使用style-loader插入到<head>标签中
            //     fallback: 'style-loader',
            //     use: 'HappyPack/loader?id=scss'
            // })
            use: [
                devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                'happypack/loader?id=scss'
            ]
        }, {
            test: /\.vue$/,
            loader: 'vue-loader'
        }, {
            test: /\.(png|jpg|jpeg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: 'images/[name].[hash:7].[ext]'
            }
        }, {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
                limit: 10000,
                name: 'fonts/[name].[hash:7].[ext]'
            }
        }]
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'], // 自动解析确定的扩展
        alias: { // 创建 import 或 require 的别名
            vue$: 'vue/dist/vue.runtime.esm.js',
            '@': resolve('/src')
        },
        symlinks: false
    },
    plugins: [
        new VueLoaderPlugin(), // webpack4.0需要本插件才可以解析vue中的html
        new webpack.HotModuleReplacementPlugin(), //热加载插件
        /**
         * extract-text-webpack-plugin还不能支持webpack4.0.0以上的版本，办法如下:
         * npm install –save-dev extract-text-webpack-plugin@next 会下载到+ extract-text-webpack-plugin@4.0.0-beta.0 
         * webpack@4.0+ 建议使用mini-css-extract-plugin插件
         */
        // new ExtractTextPlugin ("style.css"),

        new MiniCssExtractPlugin({
            filename: "css/[name]_[contenthash].css",
            chunkFilename: "css/[name]_[contenthash].css"
        }),
        new DllReferencePlugin({
            context: resolve('public'),
            manifest: require(resolve('/public/vendor_manifest.json'))
        }),
        new webpack.DefinePlugin({
            globalVar: JSON.stringify(globalVar[process.env.NODE_ENV].globalVar) // 注册全局变量
        }),
        new HtmlWebpackPlugin({
            title: 'Development',
            filename: devMode ? 'index.html' : path.join(process.cwd(), 'dist/index.html'),
            template: path.join(process.cwd(), '/public/index.html')
        }),
        new AddAssetHtmlPlugin({ filepath: path.resolve(resolve('/public/*.dll.js')) })
    ],
    devServer: { 
        ...{
            historyApiFallback: true,
            hot: true
        }, 
        ...devServerConf 
    },
    optimization: {
        minimizer: [
            // mode === 'production' 为生产环境时会打包会自动压缩代码
            new UglifyJsPlugin({
                parallel: true, // 使用多进程
                sourceMap: true,
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
HappyPack(config);
module.exports = config;