const state = {
    roles: {},


}

const getters = {}

// actions
const actions = {

}

// mutations
const mutations = {
    initRole(state, data) {
        let roles = {};
        data.forEach(item => roles[item.id] = item);
        state.roles = roles;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}