import router from '../../routes'
export default function auth() {
    return store => {
    	console.log(router)
        router.beforeEach((to, from, next) => {
            let login = true;
            console.log(store)
            // if (!login) {
            //     next({ path: '/login' })
            // } else {
            //     next();
            // }
        })
    }
}