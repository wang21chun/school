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
        .then(queryClassification)
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
    if (params.id === 0) {
        let course = filter(params, ['title', 'groupType', 'briefDescription', 'price', 'iconUrl', 'details'])
        course.startDateTime = params.startEndDate[0]
        course.endDateTime = params.startEndDate[1]
        let profession = params.profession;
        insertCourse(course)
            .then(result => {
                return new Promise((resolve, reject) => {
                    resolve(profession.map(o => {
                        return [result.insertId, o.value, o.label];
                    }));
                });
            })
            .then(insertProfession)
            .then(() => {
                res.json(RESPONSE.SUCCESS());
            }).catch((err) => {
                console.log(err);
                res.json(RESPONSE.ERROR(err));
            })
    } else {
        let course = filter(params, ['id', 'title', 'groupType', 'briefDescription', 'price', 'iconUrl', 'details'])
        course.startDateTime = params.startEndDate[0]
        course.endDateTime = params.startEndDate[1]
        const deleteTag = params.deleteTag
        let profession = params.profession.filter(el => el.id === 0);
        updateCourse(course)
            .then(result => {
                return new Promise((resolve, reject) => {
                    resolve(profession.map(o => {
                        return [course.id, o.value, o.label];
                    }));
                });
            })
            .then(insertProfession)
            .then(result => {
                return new Promise((resolve, reject) => {
                    resolve(deleteTag)
                });
            })
            .then(deleteProfession)
            .then(() => {
                res.json(RESPONSE.SUCCESS());
            }).catch((err) => {
                console.log(err);
                res.json(RESPONSE.ERROR(err));
            })

    }


});


router.get('/searchClassification', function(req, res) {
    let params = req.body;
    console.info("入参:", params);
    let sql = 'SELECT * FROM classification'
    DB.QueryList(sql, [])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        })
})

function insertProfession(data) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `profession` (`courseId`,`value`,`label`) VALUES ?";
        if (data.length > 0) {
            DB.Insert(sql, [data])
                .then(result => {
                    resolve();
                })
                .catch(reject);
        } else {
            resolve();
        }

    })
}

function deleteProfession(id) {
    return new Promise((resolve, reject) => {
        let sql = "DELETE FROM `profession` WHERE id in(?)";
        if (id.length > 0) {
            DB.Insert(sql, [id])
                .then(resolve)
                .catch(reject);
        } else {
            resolve()
        }

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



function queryClassification(courses) {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM `classification` WHERE `id` in( ? )  ";
        let { data } = courses;
        let ids = data.map(o => o.groupType);
        if (ids.length <= 0) {
            resolve(courses);
            return;
        }
        DB.QueryList(sql, [ids])
            .then(result => {
                let group = _.groupBy(result, o => o.id);
                data.forEach(o => o.classification = group[o.groupType][0]);
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


function insertCourse(course) {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO `course` SET ?";
        DB.Insert(sql, course)
            .then(resolve)
            .catch(reject)
    })
}

function updateCourse(course) {
    return new Promise((resolve, reject) => {
        let sql = "UPDATE `course` SET `title` = ?,`groupType` = ? ,`price`=?,`briefDescription`=?,`details`=?,`startDateTime`=?,`endDateTime`=? WHERE `id` = ?";
        const { title, groupType, price,briefDescription, details, startDateTime, endDateTime, id } = course
        DB.Update(sql, [title, groupType, price,briefDescription, details, startDateTime, endDateTime, id])
            .then(resolve)
            .catch(reject)
    })
}

function filter(obj, includeFiled) {
    let course = { status: 0 };
    let profession = [];
    for (let key in obj) {
        if (includeFiled.includes(key)) {
            course[key] = obj[key]
        }
    }
    return course
}

module.exports = router;