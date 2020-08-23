<style scoped>
    .edit{
        text-align: left;
    }
    .edit-form{
        width: 50%;
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
</style>
<template>
    <div>
        <div class="edit">
            <Card :bordered="true">
                <p slot="title">课程信息</p>
                <div>
                    <Form :label-width="110" ref="courseInfo" class="edit-form" :model="course" :rules="rulesInline">
                        <FormItem label="培训类别" prop="groupType">
                            <Select v-model="course.groupType">
                                <Option v-for="item in classification" :value="item.id" :key="item.id" placeholder="选择课程分类">
                                    {{ item.name }}</Option>
                            </Select>
                        </FormItem>
                        <FormItem label="课程名称" prop="title">
                            <Input type="text" v-model="course.title" placeholder="输入课程名称" />
                        </FormItem>
                        <FormItem label="工种" prop="profession">
                            <Tag v-for="(item,index) in course.profession" :key="index" :name="index" closable @on-close="delTag" type="border" color="primary">{{item.label}}</Tag>
                            <Input v-model="professionName" maxlength="10" show-word-limit placeholder="输入工种回车确认" class="min-input" @on-enter="addProfession" size="small" />
                        </FormItem>
                        <FormItem label="简要描述" prop="briefDescription">
                            <Input type="textarea" v-model="course.briefDescription" maxlength="100" show-word-limit placeholder="输入简要描述100个字以内" />
                        </FormItem>
                        <FormItem label="报名费" prop="price">
                            <Switch :value="free" @on-change="switchChange" class="label-switch">
                                <span slot="open">免</span>
                                <span slot="close">收</span>
                            </Switch>
                            <InputNumber class="input-number" :disabled="free" :min="0" v-model="course.price" :formatter="value => `￥ ${value} 元`"></InputNumber>
                        </FormItem>
                        <FormItem label="培训日期日期" prop="startEndDate">
                            <DatePicker :value="course.startEndDate" type="daterange" show-week-numbers placement="bottom-end" placeholder="培训开始-结束日期" format="yyyy-MM-dd" @on-change="datePickerChange"></DatePicker>
                        </FormItem>
                        <FormItem label="课程详细描述">
                            <Button icon="md-open" @click="openDetailsModal">编辑课程详情</Button>
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
            <quill-editor ref="courseDetails" v-model="course.details" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)" />
        </Modal>
    </div>
</template>
<script>
const _ = require('lodash');

export default {
    name: "courseEdit",
    data() {
        return {
            loading: false,
            courseDetailsModal: false,
            free: true,
            professionName: "",
            classification: [],
            course: {
                id:0,
                title: "",
                groupType: '',
                briefDescription: "",
                price: 0,
                startEndDate: [],
                iconUrl: "",
                details: "",
                profession: [],
                deleteTag:[],
            },
            editorOption: {
                placeholder: '课程详细描述'
            },
            rulesInline: {
                groupType: [{
                    type:'number',
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
           Object.assign(this.course,this.oldCourse) 
            this.free = this.oldCourse.price <= 0
            this.course.startEndDate = [this.oldCourse.startDateTime,this.oldCourse.endDateTime]
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
            if(tag.id > 0){
                this.course.deleteTag.push(tag.id)
            }
            this.course.profession.splice(index, 1);
        },
        addProfession() {
            let { profession } = this.course;
            let professionName = this.professionName;

            let existIndex = _.findIndex(profession, el => el.name == professionName);
            if (existIndex > -1) {
                this.professionName = "";
                return;
            }
            let maxValue = _.last(_.orderBy(profession, ['value'], ['asc']));
            maxValue = undefined === maxValue ? 0 : maxValue.value;
            let newProfession = {
                id:0,
                value: ++maxValue,
                label: professionName
            }
            this.course.profession.push(newProfession);
            this.professionName = "";

        },
        openDetailsModal() {
            this.courseDetailsModal = true;
            this.course.details = this.course.details === '' ?  `<p>${this.course.briefDescription}</p>` : this.course.details

        },
        datePickerChange(val) {
            this.course.startEndDate = val;
        },
        onEditorBlur(quill) {
            console.log('editor blur!', quill)
        },
        onEditorFocus(quill) {
            console.log('editor focus!', quill)
        },
        onEditorReady(quill) {
            console.log('editor ready!', quill)
        },
        onEditorChange({ quill, html, text }) {
            console.log('editor change!', quill, html, text)
            this.content = html
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