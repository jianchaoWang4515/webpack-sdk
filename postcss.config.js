const postConfig = require(process.cwd() + '/postcss.config.js');
/**
 * 增加浏览器前缀
 */

const baseConfig = {
    plugins: [
        require('autoprefixer')({
            browsers: ['last 30 versions', "> 2%", "Firefox >= 10", "ie >= 9"]
        })
    ]
}
module.exports = {
    ...baseConfig,
    ...postConfig
};