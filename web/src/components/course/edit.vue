<style scoped>
    .edit{
        text-align: left;
    }
    .edit-form{
        width: 600px;
        margin: 0px auto;
    }
    #container {width:100%; height: 300px; }  
    .label-switch{
        margin-right: 10px;
    }
    .input-number{
        width: 100px;
    }
    .min-input{
        width: 160px;
    }
    .footer{
        position: absolute;
        bottom: 15px;
    }
    .footer>button{
        margin-right: 15px;
    }
</style>
<template>
    <div>
        <div class="edit">
            <Card :bordered="true">
                <p slot="title">课程信息</p>
                <div>
                    <Form :label-width="140" ref="courseInfo" class="edit-form" :model="course" :rules="rulesInline">
                        <FormItem label="培训类别" prop="groupType">
                            <Select v-model="course.groupType">
                                <Option v-for="item in classification" :value="item.id" :key="item.id" placeholder="选择课程分类">
                                    {{ item.name }}</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="课程名称" prop="title">
                            <Input type="text" v-model="course.title" placeholder="输入课程名称" maxlength="20" show-word-limit />
                        </FormItem>
                        <FormItem label="工种" prop="profession">
                            <Tag v-for="(item,index) in course.profession" :key="index" :name="index" closable @on-close="delTag" type="border" color="primary">{{item.label}}-{{item.price}}元</Tag>
                            <Button type="primary" icon="md-add" size="small" @click="openProfessionDrawer">添加</Button>
                        </FormItem>
                        <FormItem label="简要描述" prop="briefDescription">
                            <Input type="textarea" v-model="course.briefDescription" maxlength="100" show-word-limit placeholder="输入简要描述100个字以内" />
                        </FormItem>
                        <FormItem label="计划开班时间" prop="startEndDate">
                            <DatePicker :value="course.startEndDate" type="daterange" show-week-numbers placement="bottom-end" placeholder="培训开始-结束日期" format="yyyy-MM-dd" @on-change="datePickerChange"></DatePicker>
                        </FormItem>
                        <FormItem label="培训天数" prop="workingDays">
                            <Input v-model="course.workingDays" :min="0">
                            <span slot="append">天</span>
                            </Input>
                        </FormItem>
                        <FormItem label="报名条件详细描述">
                            <Button icon="md-open" @click="openDetailsModal">编辑报名条件详细</Button>
                        </FormItem>
                        <FormItem>
                            <Button type="primary" :loading="loading" @click="save">保存</Button>
                            <Button type="default" @click="back" style="margin-left: 10px;">返回列表</Button>
                        </FormItem>
                    </Form>
                </div>
            </Card>
        </div>
        <Modal v-model="courseDetailsModal" fullscreen title="编辑课程详情">
            <quill-editor ref="courseDetails" v-model="course.details" :options="editorOption"/>
        </Modal>
        <Drawer title="添加培训工种" :closable="false" v-model="professionDrawer" width="400" :mask-closable="false">
            <Form :model="professionForm">
                <FormItem label="工种名称" prop="label">
                    <Input v-model="professionForm.label" placeholder="输入工种名称" maxlength="10" show-word-limit></Input>
                </FormItem>
                <FormItem label="报名费" prop="price">
                    <Input v-model="professionForm.price">
                    <span slot="prepend">￥</span>
                    <span slot="append">元</span>
                    </Input>
                </FormItem>
            </Form>
            <div class="footer">
                <Button type="primary" @click="addProfession">保存</Button>
                <Button type="default" @click="closeDrawer">取消</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
const _ = require('lodash');
const DEFAULT_PROFESSION = {
    id: 0,
    value: '',
    label: '',
    price: 0,
}
export default {
    name: "courseEdit",
    data() {
        return {
            loading: false,
            courseDetailsModal: false,
            free: true,
            professionDrawer: false,
            classification: [],
            professionForm: Object.assign({}, DEFAULT_PROFESSION),
            course: {
                id: 0,
                title: "",
                groupType: '',
                briefDescription: "",
                price: 0,
                startEndDate: [],
                iconUrl: "",
                details: "",
                profession: [],
                deleteTag: [],
                workingDays: 0
            },
            editorOption: {
                placeholder: '课程详细描述'
            },
            rulesInline: {
                groupType: [{
                    type: 'number',
                    required: true,
                    message: '选择培训类别',
                    trigger: 'change'
                }],
                title: [
                    { required: true, message: '输入课程名称', trigger: 'blur' },
                ],
                briefDescription: [
                    { required: true, message: '输入课程简要描述100个字以内', trigger: 'blur' },
                ],
                startEndDate: [{
                        type: 'array',
                        required: true,
                        message: '输入培训开始-结束日期',
                        trigger: 'blur',
                        validator(rule, value) {
                            let isNotEmpty = value.every(el => el !== "");
                            return isNotEmpty ? [] : [rule.message];
                        }
                    },

                ],
                profession: [{
                    type: 'array',
                    required: true,
                    message: '添加培训工种',
                    trigger: 'blur',
                    validator(rule, value) {
                        return value.length > 0 ? [] : [rule.message];
                    }
                }, ]
            }


        };

    },
    props: {
        oldCourse: {
            type: Object,
            required: false
        }
    },
    created() {
        if (undefined !== this.oldCourse && Object.keys(this.oldCourse).length > 0) {
            Object.assign(this.course, this.oldCourse)
            this.free = this.oldCourse.price <= 0
            this.course.startEndDate = [this.oldCourse.startDateTime, this.oldCourse.endDateTime]
        }
        this.searchClassification()
    },
    computed: {
        editor() {
            return this.$refs.courseDetails.quill;
        }
    },
    methods: {
        back() {
            this.$router.go(-1);
        },
        switchChange(value) {
            this.free = value;
            if (value) {
                this.course.price = 0.0
            }
        },
        delTag(event, index) {
            let tag = this.course.profession[index]
            if (tag.id > 0) {
                this.course.deleteTag.push(tag.id)
            }
            this.course.profession.splice(index, 1);
        },
        openProfessionDrawer() {
            this.professionForm = Object.assign({}, DEFAULT_PROFESSION)
            this.professionDrawer = true;
        },
        closeDrawer() {
            this.professionDrawer = false;
        },
        addProfession() {
            let { profession } = this.course;
            let {label,price} = this.professionForm;

            let existIndex = _.findIndex(profession, el => el.label === label);
            if (existIndex > -1) {
                this.$Message.warning({
                    background: true,
                    content: `[${label}] 工种名称重复`
                });
                return;
            }
            let maxValue = _.last(_.orderBy(profession, ['value'], ['asc']));
            maxValue = undefined === maxValue ? 0 : maxValue.value;
            let newProfession = {
                id: 0,
                value: ++maxValue,
                label: label,
                price
            }
            this.course.profession.push(newProfession);
            this.closeDrawer()
        },
        openDetailsModal() {
            this.courseDetailsModal = true;
            this.course.details = this.course.details === '' ? `<p>${this.course.briefDescription}</p>` : this.course.details

        },
        datePickerChange(val) {
            this.course.startEndDate = val;
        },
        searchClassification() {
            this.axios.get('/api/course/searchClassification')
                .then(res => {
                    this.classification = res.data;
                })
        },
        save() {
            this.loading = true;
            this.$refs['courseInfo'].validate(valid => {
                if (valid) {
                    let data = Object.assign({}, this.course);
                    this.axios.post("/api/course/save", data).then(res => {
                        if (res.success) {
                            this.course = {
                                title: "",
                                groupType: "",
                                briefDescription: "",
                                price: 0,
                                startEndDate: "",
                                iconUrl: "",
                                details: ""
                            }
                            this.$Message.success("保存成功!");
                            this.back();
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