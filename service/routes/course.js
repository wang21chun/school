var express = require('express');
const RESPONSE = require("../util/response");
const DB = require("../db/mysqlDB");
const _ = require('lodash');
const moment = require('moment');
var router = express.Router();


router.post('/searchList', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);

    let sql = ["select * from course"];

    let queryField = [];
    let queryValue = [];
    let searchInfo = params.searchInfo;
    for (let key in searchInfo) {
        let value = searchInfo[key];
        if (Array.isArray(value)) {
            queryField.push(key + " in(?)");
            queryValue.push(value);
        } else if (key == 'title') {
            if ('' != value) {
                queryField.push(key + " like  ?");
                queryValue.push(`${value}%`);
            }

        } else {
            queryField.push(key + " = ?");
            queryValue.push(value);
        }
    }

    if (0 < queryField.length) {
        sql.push("where");
        sql.push(queryField.join(" and "))
    }

    sql.push(" order by status, createTime DESC");

    let page = params.page;
    queryValue.push((page.current - 1) * page.pageSize);
    queryValue.push(page.pageSize);

    DB.QueryPage(sql.join(" "), queryValue)
        .then(queryProfession)
        .then(formatDate)
        .then(results => {
            Object.assign(page, results);
            res.json(RESPONSE.SUCCESS(page));
        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        })
});


router.post('/save', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);

    let sql = "INSERT INTO `course` SET ?";
    let course = { status: 0 };
    let profession = [];
    for (let key in params) {
        let value = params[key];
        if (key == 'startEndDate') {
            course['startDateTime'] = value[0];
            course['endDateTime'] = value[1];
        } else if ('profession' === key && Array.isArray(value)) {
            profession = value;
        } else {
            course[key] = value;
        }
    }
    DB.Insert(sql, course)
        .then(result => {
            return new Promise((resolve, reject) => {
                resolve(profession.map(o => {
                    return [result.insertId, o.value, o.label];
                }));
            });
        })
        .then(insertProfession)
        .catch(err => {
            console.error(err)
            res.json(RESPONSE.ERROR(err))
        })
    res.json(RESPONSE.SUCCESS());

});


function insertProfession(data) {
    return new Promise((resolve, reject) => {
        console.log(data);
        let sql = "INSERT INTO `profession` (`courseId`,`value`,`label`) VALUES ?";
        DB.Insert(sql, [data])
            .then(result => {
                resolve();
            })
            .catch(reject);
    })
}


function queryProfession(courses) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM `profession` WHERE `courseId` in( ? )  ";
        let { data } = courses;
        let ids = data.map(o => o.id);
        if (ids.length <= 0) {
            resolve(courses);
            return;
        }
        DB.QueryList(sql, [ids])
            .then(result => {
                let group = _.groupBy(result, o => o.courseId);
                data.forEach(o => o.profession = group[o.id]);
                resolve(courses);
            })
            .catch(reject);
    })
}



function formatDate(courses) {
    return new Promise((resolve, reject) => {
        courses.data.forEach(o => {
            o.startDateTime = moment(o.startDateTime).format("YYYY-MM-DD");
            o.endDateTime = moment(o.endDateTime).format("YYYY-MM-DD");
        });
        resolve(courses);
    })
}



module.exports = router;