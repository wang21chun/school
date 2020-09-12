const IP = require("./ip")

const WeChat = require('./WeChat')
const orderNo = require('./orderNo')
const XML2JS = require('xml2js');
//console.log(orderNo.random());
let data = { orderNo: "202008110024465164", price: "100", body: "下单测试", createTime: "2020-08-16 12:30:47", openid: "oqdHY5V_O8SfKvIX0sa64PwJUc40" };
// WeChat.unifiedorder(data).then(res => {
//     console.log(res);
// })

let data2 = `
<xml><return_code><![CDATA[SUCCESS]]></return_code>
<return_msg><![CDATA[OK]]></return_msg>
<appid><![CDATA[wx2381c80269646786]]></appid>
<mch_id><![CDATA[1602652887]]></mch_id>
<device_info><![CDATA[WEB]]></device_info>
<nonce_str><![CDATA[tIs2V0YasrT0ENYi]]></nonce_str>
<sign><![CDATA[E72D8D5E393D178079036203F9ACC2F1]]></sign>
<result_code><![CDATA[FAIL]]></result_code>
<err_code><![CDATA[ORDERPAID]]></err_code>
<err_code_des><![CDATA[该订单已支付]]></err_code_des>
</xml>`
XML2JS.Parser({ explicitArray: false }).parseStringPromise(data2).then(res => console.log(res))