var express = require('express');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
const OrderNo = require('../util/orderNo');
const SMSClient = require("../util/SMSClient");
const JPushClient = require("../util/JPushClient");
const _ = require('lodash');
const moment = require('moment');

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
            DB.Insert(sql, order)
                .then(result => {
                    coursePeopleQuantity(order.courseId);
                    res.json(RESPONSE.SUCCESS(order.orderNo));
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

module.exports = router;