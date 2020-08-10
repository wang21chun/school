<style scoped>
    .edit {
    text-align: left;
}
.drawer-footer{
    width: 100%;
    position: absolute;
    bottom: 0;
    left: 0;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    background: #fff;
}
</style>
<template>
    <div class="edit">
        <Card :bordered="true">
            <p slot="title">
                APP功能管理
            </p>
            <p slot="extra">
                <Button type="info" icon="md-add" @click="openDrawer()">添加功能</Button>
            </p>
            <p>
                <Table :loading="loading" border stripe :columns="columns" :data="data">
                </Table>
            </p>
        </Card>
        <Drawer title="添加功能" v-model="drawerStatus" width="500" :mask-closable="false" :styles="styles">
            <Form :model="permission" :rules="ruleValidate" ref="permissionForm">
                <FormItem label="所属模块">
                    <Select v-model="permission.module">
                        <Option v-for="item in modules" :value="item.id" :key="item.id">{{ item.label }}</Option>
                    </Select>
                </FormItem>
                <FormItem label="功能类型">
                    <RadioGroup v-model="permission.type">
                        <Radio label="0">
                            <span>功能菜单</span>
                        </Radio>
                        <Radio label="1">
                            <span>数据操作菜单</span>
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="功能名称" prop="label">
                    <Input v-model="permission.label" placeholder="请输入功能名称" />
                </FormItem>
                <FormItem label="功能标识" prop="value">
                    <Input v-model="permission.value" placeholder="请输入功能标识" />
                </FormItem>
                <FormItem label="功能图标">
                    <Input v-model="permission.icon" placeholder="请输入功能图标" />
                </FormItem>
            </Form>
            <div class="drawer-footer">
                <Button style="margin-right: 8px" @click="drawerStatus = false">关闭</Button>
                <Button type="primary" @click="save()">保存</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
export default {
    name: "permissions",
    data() {
        return {
            loading: false,
            data: [],
            columns: [{
                    title: "ID",
                    key: 'id',
                    width: 60

                },
                {
                    title: '图标',
                    key: 'icon',
                    width: 100,
                    render: (h, params) => {
                        let icon = params.row.icon;
                        return h('div', [h('Icon', {
                            props: {
                                type: icon,
                                size: 26
                            }
                        })]);
                    }
                },
                {
                    title: '功能名称',
                    key: 'label'
                },
                {
                    title: '功能标识',
                    key: 'value'
                },
                {
                    title: '功能类型',
                    key: "type",
                    align: 'center',
                    render: (h, params) => {
                        let label = params.row.type == 0 ? "功能菜单" : "数据操作菜单";
                        return h('div', [label]);
                    }
                },
                {
                    title: '所属模块',
                    key: "module",
                    align: 'center',
                    render: (h, params) => {
                        let label = params.row.module == 1 ? "易修APP" : "易修后台管理系统";
                        return h('div', [label]);
                    }
                }
            ],
            drawerStatus: false,
            styles: {
                height: 'calc(100% - 100px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            modules: [{ id: 0, label: "易修后台管理系统" }, { id: 1, label: "易修APP" }],
            permission: {
                label: "",
                value: "",
                module: 1,
                icon: "",
                type: "0"
            },
            ruleValidate: {
                label: { required: true, message: "请输入功能名称" },
                value: { required: true, message: "请输入功能标识" },
                icon: ""
            }


        };

    },
    created() {
        this.load();
    },
    computed: {},
    methods: {
        back() {
            this.$router.go(-1);
        },
        load() {
            this.axios.get("/api/permissions/getPermissions", {}).then(res => {
                if (res.success) {
                    this.data = res.data;
                } else {
                    this.$Message.success(res.msg);
                }
                this.loading = false;
            }).catch(err => {
                console.log(err);
                this.loading = false;
            })
        },
        openDrawer() {
            this.drawerStatus = true;
        },
        save() {
            this.$refs['permissionForm'].validate((valid) => {
                if (valid) {
                    let permission = Object.assign({}, this.permission);
                    this.axios.post("/api/permissions/savePermissions", permission).then(res => {
                            if (res.success) {
                                permission.id = res.data;
                                this.data.push(permission)
                                this.drawerStatus = false;
                            }
                        })
                        .catch(err => {
                            console.error(err);
                        })
                }
            })

        }
    }
}
</script>