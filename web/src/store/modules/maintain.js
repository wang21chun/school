const state = {
    maintain: {},


}

const getters = {}

// actions
const actions = {

}

// mutations
const mutations = {
    initMaintain(state, data) {
        let maintain = {};
        data.forEach(item => maintain[item.id] = item.alias);
        state.maintain = maintain;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}