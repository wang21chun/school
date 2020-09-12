const axios = require('axios');
const XML2JS = require('xml2js');
const IPv4 = require("./ip").getIPv4()
const config = require('../config.json').weixin
const SerialNumber = require('./orderNo')
const CRYPTO = require('./crypto')
const https = require('https');
const code2Session = `https://api.weixin.qq.com/sns/jscode2session?appid=${config.appid}&secret=${config.secret}&grant_type=authorization_code&js_code=`
const XML = new XML2JS.Builder({
    "rootName": "xml",
    "cdata": true,
    "xmldec": { 'version': '1.0', 'encoding': 'UTF-8', 'standalone': true }

});
var XMLParser = new XML2JS.Parser({ explicitArray: false });
const DEFAULT_ORDER = {
    "appid": config.appid,
    "mch_id": config.mch_id,
    "device_info": "WEB",
    "nonce_str": "",
    "sign": "",
    "sign_type": "MD5",
    "body": "",
    "out_trade_no": "",
    "fee_type": "CNY",
    "total_fee": "",
    "spbill_create_ip": "",
    "notify_url": "https://wodiancai.com/school/play/notify",
    "trade_type": "JSAPI",
    "openid": ""
}

const DEFAULT_OPTIONS = {
    hostname: 'api.mch.weixin.qq.com',
    port: 443,
    path: '/pay/unifiedorder',
    method: 'POST',
};


function getSign(data) {
    let keys = Object.keys(data).sort();
    let values = []
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i]
        let value = data[key]
        if ('' !== value) {
            values.push(`${key}=${value}`)
        }
    }
    let valuesStr = values.join('&')
    return CRYPTO.md5(`${valuesStr}&key=${config.key}`).toUpperCase()
}


function post(data) {
    return new Promise((resolve, reject) => {
        const options = Object.assign({}, DEFAULT_OPTIONS, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        })
        const req = https.request(options, (res) => {
            res.setEncoding('utf8');
            let datas = [];
            res.on('data', (chunk) => {
                datas.push(chunk)
            });
            res.on('end', () => {
                resolve(datas.join());
            });
        });

        req.on('error', (e) => {
            reject(e)
        });
        req.write(data);
        req.end();
    })

}


const WeChatApi = {
    code2Session: (code) => {
        return new Promise((resolve, reject) => {
            let url = code2Session + code;
            axios.get(url).then(res => {
                resolve(res.data)
            }).catch(reject)
        });
    },
    unifiedorder: (order) => {
        return new Promise((resolve, reject) => {
            let { orderNo, price, title, openid } = order;
            let nonceStr = SerialNumber.random();
            let data = { "out_trade_no": orderNo, "total_fee": price * 100, "body": title, "openid": openid, "spbill_create_ip": IPv4, "nonce_str": nonceStr };
            let playOrder = Object.assign({}, DEFAULT_ORDER, data);
            playOrder['sign'] = getSign(playOrder)
            let xml = XML.buildObject(playOrder)
            console.log(xml);
            post(xml).then(result => {
                console.log(result);
                XMLParser.parseStringPromise(result).then(objResult => {
                    console.log(objResult);
                    let { return_code, return_msg, result_code, err_code, err_code_des, prepay_id, code_url } = objResult.xml
                    resolve({
                        playOrder,
                        returnCode: return_code,
                        returnMsg: return_msg,
                        resultCode: result_code,
                        errCode: err_code,
                        errCodeDes: err_code_des,
                        prepayId: prepay_id,
                        codeUrl: code_url
                    })
                })
            }).catch(err => {
                console.error(err);
                reject(err)
            })
        })
    },
    parserNotify(data) {
        return new Promise((resolve, reject) => {
            XMLParser.parseStringPromise(data).then(resolve).catch(reject)
        })
    }
}
module.exports = WeChatApi;