# webpack-sdk
> 一个基于vue技术栈配置好的webpack4+配置，根据一定的目录结构可完成开发、打包、压缩功能</br>
>    >使用了DllPlugin及happyPack进行打包速度优化</br>

## Project directory specification
```
project
    config
        dev-server.js -----------------proxy配置
        globalVar.js  -----------------各个环境中不同的变量配置
    dist
    node_modules
    public
        index.html  ----------------html模版
    src
        *
        *
        *
        app.js  --------------------入口
    package.json
```
### dev-server.js
``` javascript
const context = ['/api'];

const pathRewrite = { '/api': '' };

context.map((item) => {
    pathRewrite[`^${item}`] = '';
});

module.exports = {
    port: 9001,
    proxy: [{
        context,
        target: 'http://127.0.0.1:8080/',
        pathRewrite
    }]
};

```
### globalVar.js
``` javascript
module.exports = {
    dev: {
        globalVar: {
            model: 'dev' // 开发环境的变量
        }
    },
    test: {
        globalVar: {
            model: 'test' // 测试环境的变量
        }
    },
    pre: {
        globalVar: {
            model: 'pre' // 预发环境的变量
        }
    },
    pro: {
        globalVar: {
            model: 'pro' // 生产环境的变量
        }
    }
};
// 使用方法
// 1.使用了eslint需要提前定义 如果没有使用可以直接访问globalVar对象
/*
global globalVar
*/

let result;
let model = globalVar.model;
if (model === 'dev') result = '我是开发环境';
if (model === 'test') result = '我是测试环境';
if (model === 'pre') result = '我是预发布环境';
if (model === 'pro') result = '我是生产环境';
```

### package.json
``` javascript
"scripts": {
    "build": "cross-env NODE_ENV=pro npm run my-webpack",
    "build-pre": "cross-env NODE_ENV=pre npm run my-webpack",
    "build-test": "cross-env NODE_ENV=test npm run my-webpack",
    "premy-webpack": "rimraf dist",
    "my-webpack": "webpack --progress --config ./node_modules/@superchao/webpack-sdk/webpack.config.dev.js",
    "start": "cross-env NODE_ENV=dev webpack-dev-server --progress --open --config ./node_modules/@superchao/webpack-sdk",
    "prebuild:dll": "rimraf public/*.js public/*.json",
    "build:dll": "webpack --progress --config ./node_modules/@superchao/webpack-sdk/webpack.config.dll.js"
  },
```
### 使用步骤
1. 创建并进入project文件夹
2. npm init 初始化
3. 修改package.json[scripts]
4. npm i @superchao/webpack-sdk -D
5. npm run build:dll (只需执行一次, 之后只需要npm run build就可以，除非不经常修改的第三方包更改才需重新执行)
6. npm start （启动服务）
7. npm run build （打包）
