const axios = require('axios');

const urls = {
    code2Session: "https://api.weixin.qq.com/sns/jscode2session?appid=wx2381c80269646786&secret=7cf020d922f21b0663dfd99abef9b9a6&grant_type=authorization_code&js_code="
}
const WeChatApi = {
    code2Session: (code) => {
        return new Promise((resolve, reject) => {
            let url = urls.code2Session+code;
            axios.get(url).then(res => {
            	resolve(res.data)
            }).catch(reject)
        });
    }
}
module.exports = WeChatApi;