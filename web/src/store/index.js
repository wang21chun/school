import Vue from 'vue'
import Vuex from 'vuex'
import User from './modules/user'
import Role from './modules/role'
import Enums from './modules/enums'
import Maintain from './modules/maintain'
import createLogger from 'vuex/dist/logger'
const debug = process.env.NODE_ENV !== 'production'
Vue.use(Vuex)
export default new Vuex.Store({
    modules: {
        User,
        Role,
        Enums,
        Maintain
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
})