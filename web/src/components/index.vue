<style scoped>
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
    }
    .layout-logo{
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;
        left: 0px;
        color: #ffff;
         height: 35px;
         line-height: 35px;
    }
    .layout-nav{
     float: right;
}
    .layout-content{
        height: 100%;
    }
    .sider{
        text-align: left;
    }
    .menu-item span{
        display: inline-block;
        overflow: hidden;
        width: 69px;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: bottom;
        transition: width .2s ease .2s;
    }
    .menu-item i{
        transform: translateX(0px);
        transition: font-size .2s ease, transform .2s ease;
        vertical-align: middle;
        font-size: 16px;
    }
    .collapsed-menu span{
        width: 0px;
        transition: width .2s ease;
    }
    .collapsed-menu i{
        transform: translateX(5px);
        transition: font-size .2s ease .2s, transform .2s ease .2s;
        vertical-align: middle;
        font-size: 22px;
    }
    .content{
        margin: 10px 10px 10px 10px;
        
    }
</style>
<template>
    <div class="layout" :style="{height:heigth+'px'}">
        <Header class="layout-header-bar" theme="dark">
            <Menu mode="horizontal" theme="dark" active-name="1">
                <div class="layout-logo">湄潭县拓业职业培训学校</div>
                <div class="layout-nav">
                    <Dropdown style="margin-left: 20px">
                        <Avatar style="background-color: #87d068" icon="ios-person" />
                        <DropdownMenu slot="list">
                            <DropdownItem>注销</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </Menu>
        </Header>
        <Layout class="layout-content">
            <Sider class="sider">
                <Menu active-name="user" theme="dark" width="auto">
                    <Submenu name="users">
                        <template slot="title">
                            <Icon type="md-contacts" />
                            用户管理
                        </template>
                        <MenuItem name="userList" :to="{path:'/userList'}">用户列表</MenuItem>
                    </Submenu>
                    <Submenu name="course">
                        <template slot="title">
                            <Icon type="md-list-box" />
                            培训课程管理
                        </template>
                        <MenuItem name="courseList" :to="{path:'/courseList'}">培训类别</MenuItem>
                    </Submenu>
                </Menu>
                <div slot="trigger"></div>
            </Sider>
            <Layout>
                <Content class="content">
                    <router-view></router-view>
                </Content>
            </Layout>
        </Layout>
    </div>
</template>
<script>
export default {
    name: "index",
    data() {
        return {
            isCollapsed: false,
            heigth: 595,
        };
    },
    created() {
        this.heigth = document.body.clientHeight - 63;
    },
    computed: {
        menuitemClasses: function() {
            return [
                'menu-item',
                this.isCollapsed ? 'collapsed-menu' : ''
            ]
        }
    },
    methods: {
        
       
    }
}
</script>