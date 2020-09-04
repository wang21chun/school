module.exports = {
    SUCCESS: (data) => {
        return {
            code: 200,
            success: true,
            data: data,
            msg: "成功"
        };
    },
    ERROR: (err, code) => {
        return {
            code: code || -1,
            success: false,
            msg: err || "系统异常"
        };
    },
    NOAUTH: () => {
        return {
            code: -2,
            success: false,
            msg: "未登录"
        };
    }
}