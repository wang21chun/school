const Core = require('@alicloud/pop-core');

var client = new Core({
    accessKeyId: 'LTAI4FhW6odQAZpFzyCWjYgP',
    accessKeySecret: 'LkK47GJwbyST2JF12yUgYwoZmSuLdG',
    endpoint: 'https://dysmsapi.aliyuncs.com',
    apiVersion: '2017-05-25'
});

var PARAMS = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": "",
    "SignName": "易修",
    "TemplateCode": "SMS_175480020",
    "TemplateParam": ""
}

var PARAMS_ORDER = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": "",
    "SignName": "易修",
    "TemplateCode": "SMS_175539332",
    "TemplateParam": ""
}

var PARAMS_ORDER_KT = {
    "RegionId": "cn-hangzhou",
    "PhoneNumbers": "",
    "SignName": "易修",
    "TemplateCode": "SMS_182535844",
    "TemplateParam": ""
}

var APPROVAL = {
     "RegionId": "cn-hangzhou",
    "PhoneNumbers": "",
    "SignName": "易修",
    "TemplateCode": "SMS_194061517",
    "TemplateParam": ""
}

var requestOption = {
    method: 'POST'
};


module.exports = {
    sendSms: (params) => {
        let param = Object.assign({}, PARAMS, params);
        return new Promise((resolve, reject) => {
            client
                .request('SendSms', param, requestOption)
                .then((result) => {
                    let ret = Object.assign({}, result);
                    ret.success = 'OK' === ret.Code;
                    resolve(ret);
                }, (ex) => {
                    reject(ex)
                })

        });
    },
    sendOrder: (params, isKtType) => {
        let param = Object.assign({}, isKtType ? PARAMS_ORDER_KT : PARAMS_ORDER, params);
        return new Promise((resolve, reject) => {
            client
                .request('SendSms', param, requestOption)
                .then((result) => {
                    let ret = Object.assign({}, result);
                    ret.success = 'OK' === ret.Code;
                    resolve(ret);
                }, (ex) => {
                    reject(ex)
                })

        });
    },
    approval:(params)=>{
        let param = Object.assign({}, APPROVAL, params);
        return new Promise((resolve, reject) => {
            client
                .request('SendSms', param, requestOption)
                .then((result) => {
                    let ret = Object.assign({}, result);
                    ret.success = 'OK' === ret.Code;
                    resolve(ret);
                }, (ex) => {
                    reject(ex)
                })

        });
    }

}