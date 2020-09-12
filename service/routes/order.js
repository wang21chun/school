var express = require('express');
const _ = require('lodash');
const moment = require('moment');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
const OrderNo = require('../util/orderNo');
const SMSClient = require("../util/SMSClient");
const JPushClient = require("../util/JPushClient");
const WeChat = require('../util/WeChat');
const DEFAULT_FAIL = `<xml>
  <return_code><![CDATA[FAIL]]></return_code>
  <return_msg><![CDATA[系统异常]]></return_msg>
</xml>`
const DEFAULT_SUCCESS = `<xml>
  <return_code><![CDATA[SUCCESS]]></return_code>
  <return_msg><![CDATA[OK]]></return_msg>
</xml>`


var router = express.Router();

router.post('/getOrders', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = ["select * from `order` "];
    let queryField = [];
    let queryValue = [];
    let searchInfo = params.searchInfo;
    for (let key in searchInfo) {
        let value = searchInfo[key];
        if (Array.isArray(value)) {
            queryField.push(key + " in(?)");
        } else {
            queryField.push(key + " = ?");
        }
        queryValue.push(value);
    }
    console.log(queryField)

    if (0 < queryField.length) {
        sql.push("where");
        sql.push(queryField.join(" and "))
    }

    sql.push(" order by createTime DESC");

    let page = params.page;
    queryValue.push((page.current - 1) * page.pageSize);
    queryValue.push(page.pageSize);

    DB.QueryPage(sql.join(" "), queryValue)
        .then(getCourse)
        .then(results => {
            Object.assign(page, results);
            return page;
        })
        .then(page => {
            res.json(RESPONSE.SUCCESS(page));
        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        })
});



router.post("/save", (req, res, next) => {
    let params = req.body;
    console.info("入参:", params);
    let sql = "INSERT INTO `order` SET ?";
    let order = Object.assign({}, params);
    order.orderNo = OrderNo.getNo();

    checkRepeat(order).then(isNoRepeat => {
        if (isNoRepeat) {
            order.payComplete = order.price <= 0 ? 1 : 0;
            DB.Insert(sql, order)
                .then(result => {
                    coursePeopleQuantity(order.courseId);
                    res.json(RESPONSE.SUCCESS(Object.assign({}, order)));
                })
                .catch(err => {
                    console.error(err)
                    res.json(RESPONSE.ERROR(err))
                })
        } else {
            res.json(RESPONSE.ERROR("不能重复报名"));
        }
    })
});


router.post('/payOrder', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "select * from `order` where `orderNo` = ?";
    DB.QueryObject(sql, params.orderNo)
        .then(result => {
            result.openid = params.openid
            return Promise.resolve({ data: [result] })
        })
        .then(getCourse)
        .then(result => {
            return Promise.resolve(result.data[0])
        })
        .then(pay)
        .then(order => {
            res.json(RESPONSE.SUCCESS(Object.assign({}, order)));
        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        })
})


router.post('/play/notify', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    if (params != '') {
        WeChat.parserNotify(params).then(data => {
            let { transaction_id, out_trade_no, result_code } = data.xml
            if (result_code === 'SUCCESS') {
                payComplete({
                    transactionId: transaction_id,
                    orderNo: out_trade_no
                }).then(result => {
                    console.info("订单支付状态变更成功 ",transaction_id,out_trade_no);
                    res.send(DEFAULT_SUCCESS)
                }).catch(err => {
                    console.error("订单支付状态变更失败", err);
                    res.send(DEFAULT_FAIL);
                })
            } else {
                res.send(DEFAULT_FAIL);
            }

        }).catch(err => {
            res.send(DEFAULT_FAIL);
        })
    } else {
        res.send(DEFAULT_FAIL);

    }

})




function pay(order) {
    return new Promise((resolve, reject) => {
        if (order.price <= 0) {
            resolve({})
        } else {
            WeChat.unifiedorder(order).then(resolve).catch(reject);
        }
    })
}

function checkRepeat(order) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM `order` WHERE `courseId` = ? AND `userId` = ?";
        DB.QueryList(sql, [order.courseId, order.userId])
            .then(result => {
                resolve(result.length <= 0);
            }).catch(err => {
                console.error(err)
                reject(err)
            })

    })
}

function coursePeopleQuantity(id) {
    let sql = "UPDATE `course` SET `peopleQuantity` = `peopleQuantity`+1 WHERE `id` = ?";
    DB.Update(sql, [id])
        .then(result => {
            console.log(result);
        })
        .catch(err => {
            console.error(err);
        })
}

function getCourse(orders) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM `course` WHERE `id` in (?) ";
        let data = orders.data;
        let courseIds = data.map(o => o.courseId);
        if (courseIds.length > 0) {
            DB.QueryList(sql, [courseIds])
                .then(queryProfession)
                .then(formatDate)
                .then(result => {
                    let group = _.groupBy(result, o => o.id);
                    data.forEach(o => {
                        let [course] = group[o.courseId];
                        o.course = course;
                    });
                    resolve(orders)
                }).catch(err => {
                    console.error(err)
                    reject(err)
                })
        } else {
            resolve(orders)
        }

    })
}



function queryProfession(courses) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM `profession` WHERE `courseId` in( ? )  ";

        let ids = courses.map(o => o.id);
        if (ids.length <= 0) {
            resolve(courses);
            return;
        }
        DB.QueryList(sql, [ids])
            .then(result => {
                let group = _.groupBy(result, o => o.courseId);
                courses.forEach(o => o.profession = group[o.id]);
                resolve(courses);
            })
            .catch(reject);
    })
}



function formatDate(courses) {
    return new Promise((resolve, reject) => {
        courses.forEach(o => {
            o.startDateTime = moment(o.startDateTime).format("YYYY-MM-DD");
            o.endDateTime = moment(o.endDateTime).format("YYYY-MM-DD");
        });
        resolve(courses);
    })
}

function payComplete(data) {
    return new Promise((resolve, reject) => {
        let sql = 'UPDATE `order` SET `transactionId`=? ,`payComplete`= 1 WHERE `orderNo` = ?'
        DB.Update(sql, [data.transactionId, data.orderNo]).then(resolve).catch(reject)
    })
}

module.exports = router;