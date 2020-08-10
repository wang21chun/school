import Vue from 'vue'
import router from './routes'
import 'es6-promise/auto'
import store from './store'
import App from './app.vue'
import ViewUI from 'view-design'
import axios from 'axios'
import VueAxios from 'vue-axios'
import 'view-design/dist/styles/iview.css';
import VueQuillEditor from 'vue-quill-editor'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme



Vue.config.productionTip = false
Vue.use(ViewUI, {
    transfer: true,
    select: {
        arrow: 'md-arrow-dropdown',
        arrowSize: 20
    }
});
Vue.use(VueQuillEditor)
Vue.use(VueAxios, axios);
Vue.prototype.HOME = '/api'
//axios.defaults.baseURL = "https://wodiancai.com/cr/";
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-=urlencoded;charset=UTF-8';
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;
axios.interceptors.request.use(function(config) {
    // 在发送请求之前做些什么
    return config;
}, function(error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function(response) {
    Object.assign(response, {
        success: 200 == response.status
    });
    if (response.success) {
        let data = response.data;
        Object.assign(data, {
            success: 200 == data.code
        });
        return data;
    }
    return response;
}, function(error) {
    // 对响应错误做点什么
    return Promise.reject(error);
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')