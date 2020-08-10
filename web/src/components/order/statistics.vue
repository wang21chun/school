<style scoped>
    .search-form {
    padding: 5px 5px;
    text-align: left;
}

.search-head {
    margin-bottom: 5px;
}

.ivu-form-item {
    margin-bottom: 0px;
}

.footer {
    padding: 5px 0px;
}


.mb0 {
    margin-bottom: 0px;
}

.br0 {
    border-radius: 0px;
    border-left: none;
    border-right: none;
}

.mb10 {
    margin-bottom: 10px;
}

.report-data {
    width: 100%;
    text-align: left;
    padding: 5px;
    box-sizing: border-box;
}

.report-data>thead>tr>th {
    text-align: center;
}

.report-data>tbody>tr>td {
    padding: 5px;
    border-left: 1px solid #dcdee2;
    border-bottom: 1px solid #dcdee2;
}

.report-data>tbody>tr>td:last-child {
    border-right: 1px solid #dcdee2;
}

.report-data>tbody>tr:first-child>td {
    border-top: 1px solid #dcdee2;
}
</style>
<template>
    <div>
        <div class="search-form">
            <Form ref="formInline" :model="report" inline :label-width="90">
                <FormItem prop="sign" label="报表类型">
                    <Select v-model="report.sign">
                        <Option :value="item.value" v-for=" item in reportType" :key="item.value">{{item.label}}</Option>
                    </Select>
                </FormItem>
                <FormItem prop="dateRange" label="选择日期段" v-show="report.sign == 'custom'">
                    <DatePicker  type="daterange" split-panels placeholder="选择日期段" @on-change="setDataRange"></DatePicker>
                </FormItem>
                <Button icon="md-download" type="primary" @click="exportExcel">下载Excel</Button>
            </Form>
        </div>
        <Card class="br0 mb10" :padding="0">
            <table class="report-data" cellspacing="0" cellpadding="0" border="0">
                <thead>
                    <tr>
                        <th colspan="4">
                            计算机报修类
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>总报修单</td>
                        <td>{{reportData.COMPUTER.total}}</td>
                        <td>等待维修</td>
                        <td>{{reportData.COMPUTER.wait}}</td>
                    </tr>
                    <tr>
                        <td>维修完成</td>
                        <td>{{reportData.COMPUTER.complete}}</td>
                        <td>维修中</td>
                        <td>{{reportData.COMPUTER.have}}</td>
                    </tr>
                    <tr>
                        <td>完成率</td>
                        <td>{{reportData.COMPUTER.completionRate}}%</td>
                        <td>平均耗时</td>
                        <td>{{reportData.COMPUTER.avgUseTimeLabel}}</td>
                    </tr>
                </tbody>
            </table>
            <table class="report-data" cellspacing="0" cellpadding="0" border="0">
                <tbody>
                    <tr>
                    </tr>
                </tbody>
            </table>
        </Card>
        <Card class="br0 mb10" :padding="0">
            <table class="report-data" cellspacing="0" cellpadding="0" border="0">
                <thead>
                    <tr>
                        <th colspan="4">
                            电工报修类
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>总报修单</td>
                        <td>{{reportData.DG.total}}</td>
                        <td>等待维修</td>
                        <td>{{reportData.DG.wait}}</td>
                    </tr>
                    <tr>
                        <td>维修完成</td>
                        <td>{{reportData.DG.complete}}</td>
                        <td>维修中</td>
                        <td>{{reportData.DG.have}}</td>
                    </tr>
                    <tr>
                        <td>完成率</td>
                        <td>{{reportData.DG.completionRate}}%</td>
                        <td>平均耗时</td>
                        <td>{{reportData.DG.avgUseTimeLabel}}</td>
                    </tr>
                </tbody>
            </table>
        </Card>
        <Card class="br0 mb10" :padding="0">
            <table class="report-data" cellspacing="0" cellpadding="0" border="0">
                <thead>
                    <tr>
                        <th colspan="4">
                            木工报修类
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>总报修单</td>
                        <td>{{reportData.MG.total}}</td>
                        <td>等待维修</td>
                        <td>{{reportData.MG.wait}}</td>
                    </tr>
                    <tr>
                        <td>维修完成</td>
                        <td>{{reportData.MG.complete}}</td>
                        <td>维修中</td>
                        <td>{{reportData.MG.have}}</td>
                    </tr>
                    <tr>
                        <td>完成率</td>
                        <td>{{reportData.MG.completionRate}}%</td>
                        <td>平均耗时</td>
                        <td>{{reportData.MG.avgUseTimeLabel}}</td>
                    </tr>
                </tbody>
            </table>
        </Card>
        <Card class="br0" :padding="0">
            <table class="report-data" cellspacing="0" cellpadding="0" border="0">
                <thead>
                    <tr>
                        <th colspan="4">
                            水工报修类
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>总报修单</td>
                        <td>{{reportData.SG.total}}</td>
                        <td>等待维修</td>
                        <td>{{reportData.SG.wait}}</td>
                    </tr>
                    <tr>
                        <td>维修完成</td>
                        <td>{{reportData.SG.complete}}</td>
                        <td>维修中</td>
                        <td>{{reportData.SG.have}}</td>
                    </tr>
                    <tr>
                        <td>完成率</td>
                        <td>{{reportData.SG.completionRate}}%</td>
                        <td>平均耗时</td>
                        <td>{{reportData.SG.avgUseTimeLabel}}</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
    name: "orderList",
    data() {
        return {
            loading: false,
            report: {
                sign: 'week',
                dateRange: [],
            },
            reportType: [{ value: 'week', label: '本周报表' }, { value: 'months', label: "本月报表" }, { value: 'year', label: "本学期报表" }, { value: 'previousMonth', label: "上月报表" }, { "value": "custom", label: "自定义" }],
            reportData: {
                "COMPUTER": {
                    total: 0,
                    wait: 0, //等待维修数量
                    have: 0, //维修中数量
                    complete: 0, //维修完成数据
                    completionRate: 0, //完成率 维修完成占总量百分比
                    avgUseTime: '0小时0分钟', //维修完成平均耗时
                    totalUseTime: 0, //维修完成总耗时
                },
                "DG": {
                    total: 0,
                    wait: 0, //等待维修数量
                    have: 0, //维修中数量
                    complete: 0, //维修完成数据
                    completionRate: 0, //完成率 维修完成占总量百分比
                    avgUseTime: '0小时0分钟', //维修完成平均耗时
                    totalUseTime: 0, //维修完成总耗时
                },
                "MG": {
                    total: 0,
                    wait: 0, //等待维修数量
                    have: 0, //维修中数量
                    complete: 0, //维修完成数据
                    completionRate: 0, //完成率 维修完成占总量百分比
                    avgUseTime: '0小时0分钟', //维修完成平均耗时
                    totalUseTime: 0, //维修完成总耗时
                },
                "SG": {
                    total: 0,
                    wait: 0, //等待维修数量
                    have: 0, //维修中数量
                    complete: 0, //维修完成数据
                    completionRate: 0, //完成率 维修完成占总量百分比
                    avgUseTime: '0小时0分钟', //维修完成平均耗时
                    totalUseTime: 0, //维修完成总耗时
                }

            }

        };
    },
    created() {
        this.getReportData();
    },
    computed: {
        ...mapState(['Role', 'Maintain', 'Enums']),
    },
    watch: {
        'report.sign': function(val) {
            if ('custom' !== val) {
                this.getReportData();
            }
        }
    },
    methods: {
        getReportData() {
            this.axios.post("/api/statistics/details", {
                sign: this.report.sign,
                dateRange: this.report.dateRange,
            }).then(res => {
                if (res.success) {
                    this.reportData = res.data;
                } else {
                    this.$Message.error(res.msg);
                }

            }).catch(err => {
                console.log(err);
            })
        },
        exportExcel() {
            this.axios.post("/api/statistics/dowload", {
                sign: this.report.sign,
                dateRange: this.report.dateRange,
            }).then(res => {
                if (res.success) {
                    let downloadUrl = this.axios.defaults.baseURL + "/excel/" + res.data;
                    window.open(downloadUrl, "_blank");
                } else {
                    this.$Message.error(res.msg);
                }

            }).catch(err => {
                console.log(err);
            })
        },
        setDataRange(data) {
            let val = data;
            val = val.filter(e => '' != e)
            this.report.dateRange = val;
            if (0 < val.length) {
                this.getReportData();
            }
        }
    }
}
</script>