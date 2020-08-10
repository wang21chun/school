<style scoped>
    .search-form{
    padding:5px 5px;
    text-align: left;
}
.search-head{
    margin-bottom: 5px;
}
.ivu-form-item{
     margin-bottom: 0px;
}
.footer{
    padding: 5px 0px;
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
.ivu-col{
    margin-bottom: 12px;
}
</style>
<template>
    <div class="search-form">
        <Card class="search-head">
            <Form inline :label-width="80">
                <FormItem label="手机号">
                    <Input type="text" v-model="searchInfo.mobile" placeholder="按手机号查询" />
                </FormItem>
                <FormItem label="姓名">
                    <Input type="text" v-model="searchInfo.name" placeholder="按姓名查询" />
                </FormItem>
                <FormItem :label-width="10">
                    <Button type="default" icon="md-search" @click="search">查询</Button>
                </FormItem>
                <FormItem :label-width="10">
                    <Button type="info" icon="md-person-add" :to="{path:'/userEdit/0'}">新增</Button>
                </FormItem>
                <FormItem :label-width="10">
                    <Button type="error" icon="md-trash" @click="deleteUser" :disabled="delDisabled">删除</Button>
                </FormItem>
            </Form>
        </Card>
        <Card :bordered="true">
            <p slot="title">账号列表</p>
            <div>
                <Table :loading="loading" border stripe ref="selection" :columns="columns" :data="page.data" @on-selection-change="select">
                    <template slot-scope="{ row, index }" slot="action">
                        <ButtonGroup>
                            <Button type="default" @click="edit(index)">修改</Button>
                            <Button type="warning" @click="permission(index)">权限</Button>
                        </ButtonGroup>
                    </template>
                </Table>
                <div class="footer">
                    <Page :total="page.total" :current="page.current" show-sizer show-total :page-size-opts="pageSizeOpts" :page-size="page.pageSize" @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
                </div>
            </div>
        </Card>
        <Drawer title="权限管理" v-model="drawerStatus" width="500" :mask-closable="false" :styles="styles">
            <Row>
                <Col span="12">姓名：{{userPermission.user.name}}</Col>
                <Col span="12">手机号：{{userPermission.user.mobile}}</Col>
            </Row>
            <Row>
                <Col span="24">
                <List item-layout="vertical" header="APP功能权限">
                    <ListItem>
                        <CheckboxGroup v-model="userPermission.funPermissionId">
                            <Checkbox :label="item.id" v-for=" item in permissions.fun" :key="item.id">
                                <Icon v-if="item.icon != ''" :type="item.icon"></Icon>
                                <span>{{item.label}}</span>
                            </Checkbox>
                        </CheckboxGroup>
                    </ListItem>
                </List>
                </Col>
            </Row>
            <Row>
                <Col span="24">
                <List item-layout="vertical" header="数据操作权限">
                    <ListItem v-for="item in deviceTypes" :key="item.value">
                        <ListItemMeta :description="item.label" />
                        <CheckboxGroup v-model="userPermission.dataPermission[item.id]">
                            <Checkbox :label="item.id" v-for=" item in permissions.data" :key="item.id">
                                <Icon v-if="item.icon != ''" :type="item.icon"></Icon>
                                <span>{{item.label}}</span>
                            </Checkbox>
                        </CheckboxGroup>
                    </ListItem>
                </List>
                </Col>
            </Row>
            <div class="drawer-footer">
                <Button style="margin-right: 8px" @click="drawerStatus = false">关闭</Button>
                <Button type="primary" @click="saveUserPermission">保存</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
import { mapState } from 'vuex'
var _ = require('lodash');
export default {
    name: "userList",
    data() {
        return {
            loading: false,
            drawerStatus: false,
            styles: {
                height: 'calc(100% - 100px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            searchInfo: {
                mobile: "",
                name: "",
            },
            deleteIds: [],
            page: {
                current: 1,
                pageSize: 10,
                total: 0,
                data: [],
            },
            columns: [{
                    type: 'selection',
                    width: 60,
                    align: 'center',
                    key: 'id'
                },
                {
                    title: '姓名',
                    key: 'name'
                },
                {
                    title: '手机号',
                    key: 'mobile'
                }, {
                    title: '注册日期',
                    key: 'createTime'
                }, {
                    title: '操作',
                    slot: 'action',
                    width: 200,
                    align: 'center',
                }
            ],

            pageSizeOpts: [10, 50, 100],
            userPermission: {
                user: {},
                dataPermission: {

                },
                funPermissionId: []
            },
            permissions: {
                fun: [],
                data: []
            },
            deviceTypes: [],
        };
    },
    created() {
        this.search()
        this.loadPermission();
        this.loadDeviceType();
    },
    computed: {
        ...mapState(['Role']),
        delDisabled: function() {
            return this.deleteIds.length <= 0;
        }

    },
    methods: {
        search() {
            this.loading = true;
            let page = Object.assign({}, this.page, { data: [] });
            this.axios.post("/api/users/searchList", {
                searchInfo: this.searchInfo,
                page
            }).then(res => {
                if (res.success) {
                    this.page = res.data;

                } else {
                    this.$Message.success(res.msg);
                }

                this.loading = false;
            }).catch(err => {
                console.log(err);
                this.loading = false;
            })

        },
        pageChange(current) {
            this.page.current = current;
            this.search();

        },
        pageSizeChange(pageSize) {
            this.page.pageSize = pageSize;
            this.search();
        },
        select(selection) {
            this.deleteIds = selection.map(row => row.id);

        },
        deleteUser() {
            this.$Modal.confirm({
                title: '删除账号确认',
                content: `是否确认删除 <b style="color:red;">${this.deleteIds.length}</b> 条账号信息？`,
                onOk: () => {
                    this.axios.get("/api/users/deletes", {
                        params: {
                            ids: this.deleteIds.join(",")
                        }
                    }).then(res => {
                        if (res.success) {
                            this.$Message.success(res.msg);
                        } else {
                            this.$Message.error(res.msg);
                        }

                    }).catch(err => {
                        console.error(err);
                        this.$Message.error("系统错误");
                    })
                    this.search();
                }
            });
        },
        loadPermission() {
            this.axios.get("/api/permissions/getPermissions", {}).then(res => {
                if (res.success) {
                    this.permissions.fun = res.data.filter(o => o.type == 0);
                    this.permissions.data = res.data.filter(o => o.type == 1);
                }
            }).catch(err => {
                console.log(err);
            })
        },
        loadDeviceType() {
            this.axios.get("/api/permissions/getDeviceType", {}).then(res => {
                if (res.success) {
                    this.deviceTypes = res.data;
                }
            }).catch(err => {
                console.log(err);
            })
        },
        edit(index) {
            let rowData = this.page.data[index];
            this.$router.push({
                path: `/userEdit/${rowData.id}`
            })
        },
        permission(index) {
            let user = Object.assign({}, this.page.data[index]);
            this.drawerStatus = true;
            this.userPermission.user = user;
            this.userPermission.funPermissionId = user.userPermissions
                .filter(o => o.deviceType == 0)
                .map(o => o.permissionsId);
            let dataPermissionId = user.userPermissions
                .filter(o => o.deviceType != 0);
            let dataPermission = _.groupBy(dataPermissionId, (o) => {
                return o.deviceType;
            });
            let temp = {};
            for (let key in dataPermission) {
                temp[key] = dataPermission[key].map(o => o.permissionsId);
            }
            this.userPermission.dataPermission = temp;
        },
        saveUserPermission() {
            let { user, dataPermission, funPermissionId } = this.userPermission;
            let data = {
                userId: user.id,
                funPermissionId,
                dataPermission
            }
            this.axios.post("/api/users/saveUserPermission", data).then(res => {
                if (res.success) {
                    this.$Message.success("操作成功");
                    this.drawerStatus = false;
                    this.search();
                }
            }).catch(err => {
                console.log(err);
            })

        }
    }
}
</script>