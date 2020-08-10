const state = {
    orderStatus: {
        0: "等待维修",
        1: "维修中",
        2: "维修完成"
    },
    deviceType: [],

}

const getters = {}

// actions
const actions = {

}

// mutations
const mutations = {
    initDeviceType(state, data) {
        let deviceType = {};
        data.forEach(o => deviceType[o.id] = o);
        state.deviceType = deviceType;
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}