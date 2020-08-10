var express = require('express');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
const JPushClient = require("../util/JPushClient");
const SMSClient = require("../util/SMSClient");
var router = express.Router();


router.post('/saveApplyFor', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);

    if (0 < params.id) {
        resetInfo(params)
            .then(result => {
                res.json(RESPONSE.SUCCESS(result));
            }).catch(err => {
                res.json(RESPONSE.ERROR(result));
            });
        return;
    }

    let sql = "select * from accessories_apply_for where order_id = ?";
    DB.QueryList(sql, [params.order_id])
        .then(result => {
            return new Promise((resolve, reject) => {
                resolve(result.length == 0);
            })
        })
        .then(result => {
            if (result) {
                return save(params);
            }
        })
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        });
});


router.post('/applyForList', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "select * from accessories_apply_for where id > 0 and `status` = ? order by create_time DESC ";
    DB.QueryList(sql, [params.searchInfo.status])
        .then(result => {
            return new Promise((resolve, reject) => {
                resolve(result);
            })
        })
        .then(result => {
            return new Promise((resolve, reject) => {
                getOrder(result).then(res => {
                    resolve(res);
                })
            })
        })
        .then(result => {
            return new Promise((resolve, reject) => {
                relationUser(result).then(res => {
                    resolve(res);
                })
            })
        })
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        });
});


router.post('/updateStatus', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "UPDATE `accessories_apply_for` SET `status` = ?,`approver_id`=?,`approver_time`=now(),`explain`=? WHERE `id` = ?";
    DB.QueryList(sql, [params.status, params.approverId, params.explain, params.id])
        .then(result => {
            proposerSendMessage(params);
            res.json(RESPONSE.SUCCESS(result));
        });
});

function save(data) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `accessories_apply_for` SET ?";
        data.status = -1;
        DB.Insert(sql, data)
            .then(result => {
                approverSendMessage();
                resolve(result.insertId);
            })
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}

function resetInfo(params) {
    return new Promise((resolve, reject) => {
        let sql = "UPDATE `accessories_apply_for` SET `user_id` = ?,`name`=?,`price`=?,`unitType`=?,`status` = -1,`approver_id`=0,`create_time`=now(),`approver_time`=now(),`explain`='' WHERE `id` = ?";
        DB.Update(sql, [params.user_id, params.name, params.price, params.unitType, params.id])
            .then(result => {
                approverSendMessage();
                resolve(result);
            }).catch(err => {
                console.error(err)
                reject(err)
            });
    })

}

function getOrder(datas) {
    return new Promise((resolve, reject) => {
        let orderIdSet = new Set();
        datas.forEach(o => {
            orderIdSet.add(o.order_id);
        });
        let orderIds = Array.from(orderIdSet);
        if (0 < orderIds.length) {
            queryOrders(orderIds)
                .then(orderMap => {
                    datas.forEach(o => o.order = orderMap.get(o.order_id) || {});
                    resolve(datas);
                }).catch(err => {
                    console.error(err);
                    reject(err);
                })
        } else {
            resolve(datas);
        }
    });
}



function queryOrders(orderIds) {
    return new Promise((resolve, reject) => {
        let sql = "select * from morder where id in(?)";
        DB.QueryList(sql, [orderIds])
            .then(orderList => {
                let orderMap = new Map();
                orderList.forEach(o => orderMap.set(o.id, o));
                resolve(orderMap);
            })
            .catch(reject);
    })
}




function relationUser(datas) {
    return new Promise((resolve, reject) => {
        let userIdSet = new Set();
        datas.forEach(o => {
            userIdSet.add(o.user_id);
        });

        let userIds = Array.from(userIdSet);
        if (0 < userIds.length) {
            getUserList(userIds)
                .then(userMap => {
                    datas.forEach(o => o.user = userMap.get(o.user_id));
                    resolve(datas);
                }).catch(err => {
                    console.error(err);
                    reject(err);
                })

        } else {
            resolve(datas);
        }
    })
}


function getUserList(userIds) {
    return new Promise((resolve, reject) => {
        let userSql = 'select id,name,mobile from user where id in(?)';
        DB.QueryList(userSql, [userIds])
            .then(userList => {
                let userMap = new Map();
                userList.forEach(o => userMap.set(o.id, o));
                resolve(userMap);
            })
            .catch(err => {
                console.error(err);
                reject(err);
            })
    });
}

function getUserPermissions(permissionsIds) {
    return new Promise((resolve, reject) => {
        let userSql = 'select user_id from user_permissions where permissions_id in(?)';
        DB.QueryList(userSql, [permissionsIds])
            .then(userIds => {
                resolve(userIds.map(o => o.user_id));
            })
            .catch(err => {
                console.error(err);
                reject(err);
            })
    });

}

function proposerSendMessage(data) {
    let p = new Promise((resolve, reject) => {
        let id = data.id;
        let sql = 'select user_id from accessories_apply_for where id =?';
        DB.QueryObject(sql, [id])
            .then(userId => {
                resolve([userId.user_id]);
            })
            .catch(err => {
                console.error(err);
                reject(err);
            })

    })
    p.then(result => {
            return new Promise((resolve, reject) => {
                resolve({
                    userIds: result,
                    message: {
                        alert: "配件审批请求有变化，请及时处理",
                        message: "配件审批请求有变化，请及时处理"
                    }
                });
            });
        })
        .then(sendMessage)
}

/**
    向审批人发通知
*/
function approverSendMessage() {
    let p = new Promise((resolve, reject) => {
        resolve([8]);
    });
    p.then(getUserPermissions)
        .then(result => {
            return new Promise((resolve, reject) => {
                resolve({
                    userIds: result,
                    message: {
                        alert: "有新的配件审批请求，请及时处理",
                        message: "有新的配件审批请求，请及时处理"
                    }
                });
            });
        })
        .then(sendMessage);

    let p2 = new Promise((resolve, reject) => {
        resolve([8]);
    });
    p2.then(getUserPermissions)
        .then(getUserList)
        .then(result => {
            result.forEach(user => {
                let smsParam = {
                    "PhoneNumbers": user.mobile,
                    "TemplateParam": ""
                }
                SMSClient.approval(smsParam).then(result => {
                    console.info(result);
                }).catch(err => {
                    console.error(err);
                })
            })
        });
}

function sendMessage(data) {
    return new Promise((resolve, reject) => {
        let alias = data.userIds.map((userId) => {
            return "user_" + userId;
        })

        let pushParam = Object.assign({}, {
            alias: alias.join(",")
        }, data.message);
        JPushClient.notification(pushParam)
            .then((result) => {
                console.info("推送完成")
                resolve();
            }).catch((error) => {
                console.info("推送失败", error)
                resolve();
            })
    });


}



module.exports = router;