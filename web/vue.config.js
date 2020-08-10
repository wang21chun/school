module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? 'https://wodiancai.com/school/web/' : "/",
    outputDir: process.env.NODE_ENV === 'production' ? '../service/public/web/' : './dist',
    filenameHashing: false,
    productionSourceMap: false,
    css: { extract: false },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('iview-loader')
            .loader('iview-loader')
            .tap(options => {
                options = options || {};
                options.prefix = false;
                return options;
            })
        config.resolve.alias
            .set('@vue', "vue/dist/vue.js")
    },
    devServer: {
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                ws: true,
                pathRewrite: {
                    "^/api": "/api"
                }

            }
        }
    }

}