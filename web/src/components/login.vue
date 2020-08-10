<style>
    .login-form {
    color: #ffff;
    max-width: 428px;
    margin: 64px auto;
    border-radius: 6px;
    border: 1px solid #eee;
    transition: all .2s ease-in-out;
    padding: 50px 20px;
    text-align: left;

}
.ivu-form-item-required .ivu-form-item-label:before{
    content: "";
}
</style>
<template>
    <div class="login-form">
        <Form label-position="top" ref="loginInfo" :model="loginInfo" :rules="rulesInline">
            <FormItem label="手机号" prop="mobile">
                <Input v-model="loginInfo.mobile" type="text"/>
            </FormItem>
            <FormItem label="密码" prop="password">
                <Input v-model="loginInfo.password" type="password" />
            </FormItem>
            <Button type="success" :loading="loading" long @click="login">登录</Button>
        </Form>
    </div>
</template>
<script>
const MINUTE = 60;
import { createNamespacedHelpers } from 'vuex'
const { mapMutations } = createNamespacedHelpers('User')
export default {
    name: 'Login',
    data() {
        return {
            codeInfo: "获取验证码",
            chronograph: MINUTE,
            loginInfo: {
                mobile: "17508507661",
                password: "12345678",
            },
            loading: false,
            rulesInline: {
                mobile: [
                    { required: true, message: '输入手机号', trigger: 'blur' },
                    { type: 'string', min: 11, max: 11, message: '输入11位手机号', trigger: 'blur' },
                ],
                password: [
                    { required: true, message: '输入密码', trigger: 'blur' },
                    { type: 'string', min: 6, message: '输入密码', trigger: 'blur' },
                ]
            }

        }
    },
    methods: {
        ...mapMutations([
            'loginComplete'
        ]),
        login() {
            this.loading = true
            this.$refs['loginInfo'].validate(valid => {
                if (valid) {
                    this.axios.post("/api/users/login", this.loginInfo).then(res => {
                        if (res.success) {
                            this.loginComplete(res.data);
                            this.$Message.success('登录成功!');
                            this.$router.replace({ path: "/" })
                        } else {
                            this.$Message.error('登录失败：' + res.msg + "!");
                        }
                        this.loading = false;
                    }).catch(err => {
                        console.log(err);
                    })

                } else {
                    this.$Message.error('登录失败!');
                    this.loading = false;
                }
            })

        }
    }
}
</script>