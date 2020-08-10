const state = {
    user: {
        id: 0,
        mobile: "",
        name: "",
        roleId:0,
        role:{},

    },
    login: false,

}

const getters = {
    userRoleEnum:state=>{
        let role = state.user.role || {};
       return role.roleEnum || ""; 
    }
}

// actions
const actions = {

}

// mutations
const mutations = {
    loginComplete(state, data) {
        state.login = 0 < data.id || false;
        state.user = data;
    },
    loginOut(state) {
        state.login = false;
        state.user = {};
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}