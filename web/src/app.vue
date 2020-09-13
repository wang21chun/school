<style>
html,
body,
#app {
    height: 100%;
    padding: 0px 0px;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0px 0px;
    padding: 0px 0px;
    font-size: 16px;
    box-sizing: border-box;
}
</style>
<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
import { mapMutations, mapState } from "vuex";
export default {
    name: 'app',
    data() {
        return {
            firstScreen: true,
        }
    },
    created() {
        this.axios.get("/api/users/getUser").then(res => {
            if (res.success) {
                this.loginComplete(res.data);
                this.firstScreen = false;
                this.$router.push('/')
            } else {
                this.loginComplete({});
            }
        }).catch(err => {
            console.error(err);
            this.loginComplete({});
        });
    },
    computed: {
        ...mapState(['User']),
    },
    methods: {
        ...mapMutations('User', ['loginComplete']),

    }
}
</script>