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
.custom-wide-table{
    overflow-x: scroll;
    padding: 0px 0px 15px 0px;
}
</style>
<template>
    <div class="search-form">
        <Card class="search-head">
            <Form inline :label-width="80">
                <FormItem label="课程名称">
                    <Input type="text" v-model="searchInfo.title" placeholder="按课程名称查询" />
                </FormItem>
                <FormItem :label-width="10">
                    <Button type="default" icon="md-search" @click="search">查询</Button>
                </FormItem>
                <FormItem :label-width="10">
                    <Button type="info" icon="md-add" :to="{path:'/courseEdit'}">新增</Button>
                </FormItem>
            </Form>
        </Card>
        <Card :bordered="true">
            <p slot="title">课程列表</p>
            <div>
                <div class="custom-wide-table">
                    <Table :loading="loading" border stripe ref="selection" :columns="columns" :data="page.data" @on-selection-change="select" width="2000">
                        <template slot-scope="{ row, index }" slot="action">
                            <Dropdown @on-click="operation">
                                <Button size="small" ghost type="info">
                                    <Icon type="ios-arrow-down"></Icon>
                                </Button>
                                <DropdownMenu slot="list">
                                    <DropdownItem :name="'edit-'+index" :disabled="0 !== row.status">修改</DropdownItem>
                                    <DropdownItem :name="'status-'+index" :disabled=" 0 !== row.status" :divided="true">开始报名</DropdownItem>
                                    <DropdownItem :name="'status-'+index" :disabled="0 === row.status" :divided="true">报名结束</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </template>
                    </Table>
                </div>
                <div class="footer">
                    <Page :total="page.total" :current="page.current" show-sizer show-total :page-size-opts="pageSizeOpts" :page-size="page.pageSize" @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
                </div>
            </div>
        </Card>
    </div>
</template>
<script>
export default {
    name: "maintainList",
    data() {
        return {
            loading: false,
            searchInfo: {
                title: ""
            },
            page: {
                current: 1,
                pageSize: 10,
                total: 0,
                data: [],
            },
            columns: [{
                    title: '操作',
                    slot: 'action',
                    width: 70,
                }, {
                    title: '图片',
                    key: 'iconUrl',
                    width: 70,
                },
                {
                    title: '课程名称',
                    key: 'title',
                    maxWidth: 200,
                    tooltip: true,
                },
                {
                    title: '状态',
                    width: 90,
                    render: (h, { row }) => {
                        let { status } = row;
                        let label = 0 === status ? "未报名" : 1 === status ? "报名中" : "报名结束";
                        return h('div', label);
                    }
                },
                {
                    title: '报名人数',
                    key: 'peopleQuantity',
                    width: 100,
                },
                {
                    title: '分类',
                    key: 'classification',
                    width: 100,
                    render: (h, { row }) => {
                        let { classification } = row;
                        return h('div', classification.name);
                    }
                },

                {
                    title: '报名费',
                    key: 'price',
                    width: 80,
                },
                {
                    title: '工种',
                    align: "left",
                    maxWidth: 200,
                    tooltip: true,
                    render: (h, { row }) => {
                        let { profession=[] } = row;
                        let tags = profession.map(o => o.label);
                        return h('div', tags.join(","));
                    }
                },
                {
                    title: '培训时间',
                    align: "left",
                    width: 210,
                    render: (h, { row }) => {
                        let { startDateTime, endDateTime } = row;
                        return h('div', startDateTime + " 到 " + endDateTime);
                    }
                }, {
                    title: '简要描述',
                    key: 'briefDescription',
                    align: "left",
                    minWidth: 150,
                    tooltip: true,
                }
            ],

            pageSizeOpts: [10, 50, 100],

        };
    },
    created() {
        this.search()
    },
    computed: {
        delDisabled: function() {
            return this.deleteIds.length <= 0;
        }
    },
    methods: {
        search() {

            this.loading = true;
            let page = Object.assign({}, this.page, { data: [] });
            this.axios.post("/api/course/searchList", {
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
        operation(name) {
            let names = name.split("-");
            let { data } = this.page;
            let index = names[1];
            if ('edit' === names[0]) {
                this.$router.push({ name: 'courseEdit', params: { "oldCourse": data[index] } })
            }
        },
    }
}
</script>