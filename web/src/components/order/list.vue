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
.view-picture{
    width: 100%;
    height: 100%;
}
.option{
    width: 36px;
    height: 50px;
    position: absolute;
    padding: 7px 0px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    cursor: pointer;
}
.option-previous{
    left: 16px;
    top:50%;
}
.option-next{
    right: 16px;
    top:50%;
}
</style>
<template>
    <div class="search-form">
        <Card class="search-head">
            <Form inline :label-width="50">
                <FormItem label="状态">
                    <Select v-model="searchInfo.status" placeholder="按状态查询" :clearable="true">
                        <Option v-for="(val,key) in Enums.orderStatus" :key="+key" :value="+key">{{val}}</Option>
                    </Select>
                </FormItem>
                <FormItem :label-width="10">
                    <Button type="default" icon="md-search" @click="search">查询</Button>
                </FormItem>
            </Form>
        </Card>
        <Card :bordered="true">
            <p slot="title">报修单列表</p>
            <Table :loading="loading" border stripe :columns="columns" :data="page.data">
                <template slot-scope="{ row }" slot="status">
                    <Tag :color="tagColors[row.status]">{{Enums.orderStatus[row.status]}}</Tag>
                </template>
                <template slot-scope="{ row }" slot="picture">
                    <Button type="dashed" icon="md-eye" @click="view(row)" :disabled="'' ===row.pictureUrl"> 打开图片</Button>
                </template>
            </Table>
            <div class="footer">
                <Page :total="page.total" :current="page.current" show-sizer show-total :page-size-opts="pageSizeOpts" :page-size="page.pageSize" @on-change="pageChange" @on-page-size-change="pageSizeChange"></Page>
            </div>
        </Card>
        <Modal v-model="pictureModal" title="故障图片" width="80">
            <div>
                <div class="option option-previous" @click="switchOption(-1)" v-show="showOption">
                    <Icon type="ios-arrow-back" size="36" />
                </div>
                <img class="view-picture" :src="pictureImgs[pictureIndex]">
                <div class="option option-next" @click="switchOption(1)" v-show="showOption">
                    <Icon type="ios-arrow-forward" size="36" />
                </div>
            </div>
            <div slot="footer">
                <Button @click="closeViewModal">关闭</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import moment from 'moment'
export default {
    name: "orderList",
    data() {
        return {
            loading: false,
            pictureModal: false,
            searchInfo: {
                status: "",
            },
            page: {
                current: 1,
                pageSize: 10,
                total: 0,
                data: [],
            },
            columns: [{
                title: '单号',
                key: 'orderNo'
            }, {
                title: '维护点',
                key: 'mainationName',
                render: (h, params) => {
                    return h('span', this.Maintain.maintain[params.row.maintainId]);
                }
            }, {
                title: '状态',
                slot: 'status',
                width: 110,
            }, {
                title: '设备类型',
                width: 100,
                render: (h, params) => {
                    return h('span', this.Enums.deviceType[params.row.deviceType].label);
                }
            }, {
                title: '报修人',
                key: "user.name",
                width: 80,
                render: (h, params) => {
                    return h('span', params.row.user.name);
                }
            }, {
                title: '报修时间',
                render: (h, params) => {
                    return h('span', moment(params.row.createTime).format("YYYY-MM-DD HH:mm:ss"));
                }
            }, {
                title: '详细地址',
                key: 'address',
            }, {
                title: '故障描述',
                key: 'description',
            }, {
                title: '故障图片',
                slot: 'picture',
                width: 150,
                align: 'center',
            }],

            pageSizeOpts: [10, 50, 100],
            tagColors: ['error', 'warning', 'success'],
            pictureImgs: [],
            pictureIndex: 0,
            showOption: false,
            baseURL: this.axios.defaults.baseURL || "",

        };
    },
    created() {
        this.search()
    },
    computed: {
        ...mapState(['Role', 'Maintain', 'Enums']),
    },
    methods: {
        search() {

            this.loading = true;
            let page = Object.assign({}, this.page, { data: [] });
            this.axios.post("/api/order/getOrders", {
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

        edit(index) {
            let rowData = this.page.data[index];
            this.$router.push({
                path: `/userEdit/${rowData.id}`
            })
        },
        view(data) {
            let pictureUrls = data.pictureUrl || "";
            this.pictureImgs = pictureUrls.split(",").map(o => this.baseURL + "/uploads/" + o);
            this.pictureModal = true;
            this.showOption = this.pictureImgs.length > 1;
            this.pictureIndex = 0;
        },
        closeViewModal() {
            this.pictureModal = false;
            this.pictureImgs = [];
            this.pictureIndex = 0;
        },
        switchOption(opt) {
            let index = this.pictureIndex + opt;
            let maxLength = this.pictureImgs.length;
            index = 0 > index ? maxLength - 1 : index >= maxLength ? 0 : index;
            console.log(index);
            this.pictureIndex = index;
        }
    }
}
</script>