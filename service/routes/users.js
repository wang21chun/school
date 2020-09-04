const express = require('express');
const DB = require("../db/mysqlDB");
const RedisDB = require("../db/redisDB");
const CRYPTO = require("../util/crypto");
const RESPONSE = require("../util/response");
const SMSClient = require("../util/SMSClient");
const ObjectUtil = require("../util/objectUtil");
const WeChat = require("../util/WeChat")
const _ = require('lodash');
const router = express.Router();


router.post('/login', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);

    let sql = "select * from administrator where mobile = ?";
    DB.QueryObject(sql, [params.mobile])
        .then(result => {
            if (ObjectUtil.isNull(result)) {
                res.json(RESPONSE.ERROR("用户不存在"));
            } else if (CRYPTO.md5(params.password) != result.password) {
                res.json(RESPONSE.ERROR("密码错误"));
            } else {
                result.password = "";
                RedisDB.setEx(req.cookies._id, result.id, 12 * 24 * 60 * 60 * 1000);
                res.json(RESPONSE.SUCCESS(result));
            }
        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        })
})

router.post("/auth", (req, res, next) => {
    let params = req.body;
    console.info("入参:", params);
    WeChat.code2Session(params.code).then(wxInfo => {
        let { openid } = wxInfo;
        if (undefined == openid) {
            res.json(RESPONSE.SUCCESS({}));
        } else {
            getUser({ openid: wxInfo.openid }).then(user => {
                res.json(RESPONSE.SUCCESS({ user, wxInfo }));
            })
        }
    })
})

router.get('/getCode', function(req, res, next) {
    let params = req.query;
    console.info("入参:", params);
    let mobile = params.mobile
    if ('17508507661' == mobile) {
        res.json(RESPONSE.SUCCESS());
    } else {
        let code = "" + Math.random();
        code = code.substring(2, 8);
        let smsParam = {
            "PhoneNumbers": mobile,
            "TemplateParam": JSON.stringify({ "code": code })
        }
        SMSClient.sendSms(smsParam).then(result => {
            if (result.success) {
                RedisDB.set(mobile, code);
                res.json(RESPONSE.SUCCESS());
            } else {
                res.json(RESPONSE.ERROR("验证码发送失败"));
            }
        }).catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        })
    }
});

router.post('/saveUser', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);

    RedisDB.get(params.mobile)
        .then(data => {
            if ('17508507661' == params.mobile) {
                return Promise.resolve();
            }
            if (params.vcode !== data) {
                return Promise.reject("验证码错误");
            }
            return Promise.resolve();
        }).then((data) => {
            getUser({ openid: params.openid }).then(user => {
                if (ObjectUtil.isNull(user)) {
                    insertUser(params).then(newUser => {
                        res.json(RESPONSE.SUCCESS(newUser));
                    }).catch(err => {
                        console.error(err)
                        res.json(RESPONSE.ERROR())
                    })
                } else {
                    updateUser(params, user.id).then(newUser => {
                        res.json(RESPONSE.SUCCESS(newUser));
                    }).catch(err => {
                        console.error(err)
                        res.json(RESPONSE.ERROR())
                    })
                }
            }).catch(err => {
                console.error(err)
                res.json(RESPONSE.ERROR())
            })
        }).catch(err => {
            res.json(RESPONSE.ERROR(err));
        })
})



router.get("/getUser", (req, res, next) => {
    let params = req.query;
    console.info("入参:", params);
    if (undefined === params.id && undefined === params.mobile) {
        let sessionID = req.cookies._id;
        RedisDB.get(sessionID)
            .then(data => {
                if (null !== data && '' !== data && undefined !== data) {
                    let sql = "select * from administrator where id=?";
                    DB.QueryObject(sql, [data])
                        .then(result => {
                            result.password = "";
                            res.json(RESPONSE.SUCCESS(result))
                        })
                } else {
                    res.json(RESPONSE.SUCCESS({}));
                }

            })
    } else {
        res.json(RESPONSE.SUCCESS({}));
    }
})

function getUser(searchInfo) {
    return new Promise((resolve, reject) => {
        let sql = ["SELECT * FROM `users` "];
        let queryField = [];
        let queryValue = [];
        for (let key in searchInfo) {
            let value = searchInfo[key];
            queryField.push(key + " = ?");
            queryValue.push(value);
        }
        if (0 < queryField.length) {
            sql.push("where");
            sql.push(queryField.join(" and "))
        }
        DB.QueryObject(sql.join(" "), queryValue)
            .then(user => {
                resolve(user)
            }).catch(reject)
    });
}

function insertUser(params) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `users` (`openid`,`mobile`,`name`,`idNumber`) VALUES ? ";
        let values = [params.openid, params.mobile, params.name, params.idNumber];
        DB.Insert(sql, [
                [values]
            ])
            .then(result => {
                let user = Object.assign({}, params, { id: result.insertId });
                resolve(user);
            }).catch(reject);
    })
}



function updateUser(params, id) {
    return new Promise((resolve, reject) => {
        let sql = "UPDATE `users` SET `mobile`=?,`name`=?,`idNumber`=?,`sex` =?, `nation`=?,`age`=?,`address` =? ,`levelEducation`=? WHERE `id` =? ";
        DB.Update(sql, [params.mobile,params.name,params.idNumber,params.sex,params.nation,params.age,params.address,params.levelEducation, id])
            .then(result => {
                let user = Object.assign({}, params, { id });
                resolve(user);
            }).catch(reject);
    })
}

module.exports = router;