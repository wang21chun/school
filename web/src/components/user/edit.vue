<style scoped>
    .edit{
        text-align: left;
    }
    .edit-form{
        width: 40%;
        margin: 0px auto;
    }
</style>
<template>
    <div class="edit">
        <Card :bordered="true">
            <p slot="title">编辑账号信息</p>
            <div>
                <Form :label-width="100" ref="editInfo" class="edit-form" :model="userInfo" :rules="rulesInline">
                    <FormItem label="手机号" prop="mobile">
                        <Input type="text" v-model="userInfo.mobile" placeholder="手机号"/>
                    </FormItem>
                    <FormItem label="姓名" prop="name">
                        <Input type="text" v-model="userInfo.name" placeholder="姓名"/>
                    </FormItem>
                    <FormItem label="密码" prop="password">
                        <Input type="password" v-model="userInfo.password" placeholder="密码"/>
                    </FormItem>
                    <FormItem label="确认密码" prop="confirmPassword">
                        <Input type="password" v-model="userInfo.confirmPassword" placeholder="确认密码"/>
                       
                    </FormItem>
                    <FormItem label="账号角色">
                        <Select v-model="userInfo.roleId">
                            <Option v-for="(val, key) in Role.roles" :value="+key" :key="key">{{ val.name }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="所属维护点" prop="maintain">
                        <Select v-model="userInfo.maintain" multiple>
                            <Option v-for="(val, key) in Maintain.maintain" :value="+key" :key="key">{{ val }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" :loading="loading" @click="save">保存</Button>
                        <Button type="default" @click="back" style="margin-left: 10px;">返回列表</Button>
                    </FormItem>
                </Form>
            </div>
        </Card>
    </div>
</template>
<script>
import { mapState } from 'vuex'

export default {
    name: "userEdit",
    data() {
        return {
            loading: false,
            userInfo: {
                id: 0,
                mobile: "",
                name: "",
                password: "",
                confirmPassword: "",
                roleId: 4,
                maintain: [],
            },
            rulesInline: {
                mobile: [
                    { required: true, message: '输入手机号', trigger: 'blur' },
                    { type: 'string', len: 11, message: '输入11位手机号', trigger: 'blur' },
                    { type: 'string', match: /\d{11}/, message: '输入11位手机号', trigger: 'blur' },
                    {
                        trigger: 'blur',
                        validator: (rule, value, callback) => {

                            if (0 < this.userInfo.id) {
                                callback();
                                return;
                            }
                            this.axios.get("/api/users/getUser?mobile=" + value)
                                .then(res => {
                                    if (res.success && 0 < res.data.id) {
                                        callback(new Error('手机号重复'));
                                    } else {
                                        callback()
                                    }
                                })
                                .catch(err => {
                                    console.error(err);
                                })
                        },
                    }
                ],
                password: [{
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        value = value || "";
                        if (0 < this.userInfo.id && '' == value.trim()) callback();
                        if ('' == value.trim().length) callback(new Error('输入密码'))
                        if (value.trim().length < 8) callback(new Error('密码至少8位'))
                        else callback();
                    },
                }],
                confirmPassword: [{
                    trigger: 'blur',
                    validator: (rule, value, callback) => {
                        value = value || "";
                        if (0 < this.userInfo.id && '' == value.trim()) callback();
                        if ('' == value.trim().length) callback(new Error('输入确认密码'))
                        if (value != this.userInfo.password) callback(new Error('密码与确认密码不一致'))
                        else callback();
                    },
                }],
                name: [
                    { required: true, message: '输入姓名', trigger: 'blur' },
                ],
                maintain: [{
                    trigger: 'change',
                    validator: (rule, value, callback) => {
                        value = value || [];
                        if (0 >= value.length) callback(new Error('请至少选择一个所属维护点'));
                        else callback();
                    }
                }]
            }


        };

    },
    created() {
        let id = this.$route.params.id;
        if (0 < id) {
            this.loadUser(id);
        }
    },
    computed: {
        ...mapState(['Role', 'Maintain'])
    },
    methods: {
        back() {
            this.$router.go(-1);
        },
        loadUser(id) {
            this.axios.get("/api/users/getUser", {
                    params: {
                        id
                    }
                })
                .then(res => {
                    if (res.success) {
                        this.userInfo = res.data;
                    }
                })
                .catch(err => {
                    console.error(err);
                })

        },

        save() {
            this.loading = true;
            this.$refs['editInfo'].validate(valid => {
                if (valid) {
                    let userInfo = Object.assign({}, this.userInfo);
                    delete userInfo.confirmPassword;
                    this.axios.post("/api/users/saveUser", userInfo).then(res => {
                        if (res.success) {
                            this.$Message.success("保存成功!");
                        } else {
                            this.$Message.error("保存失败：" + res.msg + "!");
                        }
                    }).catch(err => {
                        console.error(err)
                        this.$Message.error("系统错误");
                    })
                }
                this.loading = false;
            })
        }
    }
}
</script>