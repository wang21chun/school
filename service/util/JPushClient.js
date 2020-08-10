const { JPush, JPushAsync } = require("jpush-async")
const client = JPushAsync.buildClient('3a5b38b7129e292416e059a6', '3476502d18c01090663cf5d4');
module.exports = {
    notification: (params) => {
        return new Promise((resolve, reject) => {
            client.push().setPlatform(JPush.ALL)
                .setAudience(JPush.alias(params.alias))
                .setNotification(params.alert)
                .setMessage(params.message)
                .setOptions(null, null,null,false)
                .send()
                .then((result) => {
                    console.info("推送结果:", result)
                    resolve(result);
                }).catch((err) => {
                    console.error("推送失败:", err)
                    reject(err);
                });
        });
    }
}