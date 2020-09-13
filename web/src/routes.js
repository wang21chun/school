import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import Index from './components/index.vue'
const login = () => import('./components/login.vue')
const userList = () => import('./components/user/list.vue')
const userEdit = () => import('./components/user/edit.vue')
const courseList = () => import('./components/course/list.vue')
const courseEdit = () => import('./components/course/edit.vue')
const orderList = () => import('./components/order/list.vue')
Vue.use(VueRouter)
const router = new VueRouter({
    routes: [{
            path: '/',
            component: Index,
            meta: { requiresAuth: true },
            name: 'index',
            children: [{
                path: '/userList',
                component: userList,
                meta: { requiresAuth: true },
                name: 'userList',
            }, {
                path: '/userEdit/:id',
                component: userEdit,
                meta: { requiresAuth: true },
                name: 'userEdit',
            }, {
                path: '/courseList',
                component: courseList,
                meta: { requiresAuth: true },
                name: 'courseList',
            }, {
                path: '/courseEdit',
                component: courseEdit,
                meta: { requiresAuth: true },
                name: 'courseEdit',
                props: (route) => route.params
            }, {
                path: '/orderList',
                component: orderList,
                meta: { requiresAuth: true },
                name: 'orderList',
            }]
        },
        { path: '/login', component: login, name: "login", meta: { requiresAuth: false }, }
    ]
});

router.beforeEach((to, from, next) => {
    let login = to.matched.some(record => true == record.meta.requiresAuth) && !store.state.User.login;
    if (login) {
        next({ name: 'login' })
    } else {
        next();
    }
})
export default router