var express = require('express');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
const DateUtil = require("../util/dateUtil")
const ExcelUtil = require("../util/excel")
var router = express.Router();
const ORDER_STATUS_LABEL = ['wait', 'have', 'complete'];
const COMPLETE_STATUS = 2;


router.post('/', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let dateSegment = getDateSegment(params);

    all(dateSegment)
        .then(results => {
            let COMPUTER = results[0];
            COMPUTER.orderDetails = {};
            let DG = results[1];
            DG.orderDetails = {};
            let MG = results[2];
            MG.orderDetails = {};
            let SG = results[3];
            SG.orderDetails = {};
            res.json(RESPONSE.SUCCESS({
                COMPUTER,
                DG,
                MG,
                SG
            }));
        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        });

});





router.post('/details', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let dateSegment = getDateSegment(params);
    console.info("dateSegment:",dateSegment)
    all(dateSegment)
        .then(results => {
            let COMPUTER = results[0];
            COMPUTER.orderDetails = groupByStatus(COMPUTER.orderDetails);
            let DG = results[1];
            DG.orderDetails = groupByStatus(DG.orderDetails);
            let MG = results[2];
            MG.orderDetails = groupByStatus(MG.orderDetails);
            let SG = results[3];
            SG.orderDetails = groupByStatus(SG.orderDetails);
            res.json(RESPONSE.SUCCESS({
                COMPUTER,
                DG,
                MG,
                SG
            }));
        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        });

});





router.post('/dowload', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let dateSegment = getDateSegment(params);
    all(dateSegment)
        .then(results => {
            let COMPUTER = results[0];
            COMPUTER.orderDetails = groupByStatus(COMPUTER.orderDetails);
            let DG = results[1];
            DG.orderDetails = groupByStatus(DG.orderDetails);
            let MG = results[2];
            MG.orderDetails = groupByStatus(MG.orderDetails);
            let SG = results[3];
            SG.orderDetails = groupByStatus(SG.orderDetails);
            let allMaination = results[4];

            let datas = [{ "label": "计算机报修类", "data": COMPUTER }, { "label": "电工报修类", "data": DG }, { "label": "木工报修类", "data": MG }, { "label": "水工报修类", "data": SG }]
            let fileName = ExcelUtil.exportExcel({ "dataDuration": dateSegment, "maination": allMaination, "statistics": datas });
            res.json(RESPONSE.SUCCESS(fileName));

        })
        .catch(err => {
            console.error(err);
            res.json(RESPONSE.ERROR(err))
        });


});




function all(dateSegment) {
    return new Promise((resolve, reject) => {
        let COMPUTER = new Promise((resolve, reject) => {
            let p = new Promise((resolve, reject) => {
                resolve(dateSegment.concat([1]));
            });
            p.then(getOrder)
                .then(getProgress)
                .then(setUser)
                .then(statistics)
                .then(resolve)
                .catch(reject);
        });

        let DG = new Promise((resolve, reject) => {
            let p = new Promise((resolve, reject) => {
                resolve(dateSegment.concat([2]));
            });
            p.then(getOrder)
                .then(getProgress)
                .then(setUser)
                .then(statistics)
                .then(resolve)
                .catch(reject);
        });

        let MG = new Promise((resolve, reject) => {
            let p = new Promise((resolve, reject) => {
                resolve(dateSegment.concat([3]));
            });
            p.then(getOrder)
                .then(getProgress)
                .then(setUser)
                .then(statistics)
                .then(setUser)
                .then(resolve)
                .catch(reject);

        });

        let SG = new Promise((resolve, reject) => {
            let p = new Promise((resolve, reject) => {
                resolve(dateSegment.concat([4]));
            });
            p.then(getOrder)
                .then(getProgress)
                .then(setUser)
                .then(statistics)
                .then(resolve)
                .catch(reject);
        });

        let allMaination = new Promise((resolve, reject) => {
            let p = new Promise((resolve, reject) => {
                resolve();
            });

            p.then(getAllMaination)
                .then(resolve)
                .catch(reject);
        });



        Promise.all([COMPUTER, DG, MG, SG, allMaination])
            .then(resolve)
            .catch(reject);
    })
}

function getAllMaination() {
    return new Promise((resolve, reject) => {
        let sql = "select * from maintain where id > ?";
        DB.QueryList(sql, [0])
            .then(resolve)
            .catch(err => {
                reject(err);
            });
    });
}

function getOrder(query) {
    return new Promise((resolve, reject) => {
        let orderSql = "select * from morder where   createTime >= ? and createTime <= ? and deviceType = ? ";
        DB.QueryList(orderSql, query)
            .then(resolve)
            .catch(err => {
                console.error(err);
                reject(err);
            });
    });
}

function getProgress(orders) {
    return new Promise((resolve, reject) => {
        let progressSql = "SELECT * FROM order_progress where orderId in(?)";
        if (0 < orders.length) {
            let ids = orders.map(o => o.id);
            DB.QueryList(progressSql, [ids])
                .then(progress => {
                    progress = progress || [];
                    resolve({ orders, progress });
                })
                .catch(err => {
                    console.error(err);
                    reject(err);
                })
        } else {
            resolve({ orders: [], progress: [] });
        }
    });

}


function statistics(data) {
    return new Promise((resolve, reject) => {
        let reportData = {
            total: 0,
            wait: 0, //等待维修数量
            have: 0, //维修中数量
            complete: 0, //维修完成数据
            completionRate: 0, //完成率 维修完成占总量百分比
            avgUseTime: 0, //维修完成平均耗时
            totalUseTime: 0, //维修完成总耗时
            orderDetails: {},
        };
        reportData.orderDetails = data;
        let { orders, progress } = data;
        let orderSize = orders.length;
        if (undefined === orders || 0 >= orderSize) {
            resolve(reportData);
        }
        reportData.total = orderSize;

        let progressMap = new Map();
        progress.forEach(ele => {
            let key = `${ele.orderId}${ele.status}`;
            progressMap.set(key, ele.createTime);
        })

        orders.forEach(ele => {
            reportData[ORDER_STATUS_LABEL[ele.status]]++;
            if (COMPLETE_STATUS == ele.status) {
                let key = `${ele.id}${ele.status}`;
                let completeTime = progressMap.get(key);
                if (undefined != completeTime) {
                    let diff = DateUtil.difference(completeTime, ele.createTime);
                    reportData.totalUseTime += diff;
                }
            }
        });
        reportData.completionRate = reportData.total == 0 ? 0 : Math.round(reportData.complete / reportData.total * 100);
        let avgUseTime = reportData.complete == 0 ? 0 : (reportData.totalUseTime / reportData.complete);
        let minutes = Math.round((avgUseTime % 3600000) / 60000);
        let hours = Math.round(avgUseTime / 3600000);
        reportData.avgUseTimeLabel = `${hours}小时${minutes}分钟`;
        resolve(reportData);
    })

}



function setUser(data) {
    return new Promise((resolve, reject) => {
        let { orders = [], progress = [] } = data;
        let userIdSet = new Set();
        orders.forEach(o => {
            userIdSet.add(o.userId);
        });
        progress.forEach(o => {
            userIdSet.add(o.repairUserId);
        });


        let userIds = Array.from(userIdSet);

        if (0 >= userIds.length) {
            resolve(data);
            return;
        }

        let userSql = 'select id,name,mobile from user where id in(?)';
        DB.QueryList(userSql, [userIds])
            .then(userList => {
                let userMap = new Map();
                userList.forEach(o => userMap.set(o.id, o));

                orders.forEach(o => {
                    o.user = userMap.get(o.userId) || {};
                });
                progress.forEach(o => {
                    o.repairUser = userMap.get(o.repairUserId) || {};
                });
                resolve(data);
            })
            .catch(err => {
                console.error(err);
                reject(err);
            })
    });
}

function groupByStatus(data) {
    //下标0:待维修 1：维修中 2：维完成
    let statusGroup = [
        [],
        [],
        []
    ];
    let { orders, progress } = data;
    let progressMap = new Map();
    progress.forEach(ele => {
        let key = `${ele.orderId}`;
        let progs = progressMap.get(key) || [];
        progs.push(ele);
        progressMap.set(key, progs);
    })
    orders.forEach(ele => {
        let key = `${ele.id}`;
        let progs = progressMap.get(key) || [];
        let orderDetails = { order: ele, progs: progs };
        statusGroup[ele.status].push(orderDetails);
    });
    return statusGroup;
}

function getDateSegment(params) {
    let dateSegment = [];
    let sign = params.sign || "week"
    switch (sign) {
        case 'previousMonth':
            dateSegment = DateUtil.getPreviousMonthDuration();
            break;
        case 'months':
            dateSegment.push(DateUtil.getFirstDayMonth());
            dateSegment.push(DateUtil.getNowDate());
            break;
        case 'year':
            dateSegment.push(DateUtil.getFirstDaYear());
            dateSegment.push(DateUtil.getNowDate());
            break;
        case 'custom':
            let dataRange = params.dateRange;
            let start = DateUtil.format(dataRange[0], DateUtil.DEFAULT_DATE);
            dateSegment.push(start);
            let end = DateUtil.format(dataRange[1], DateUtil.DEFAULT_DATE_LAST);
            dateSegment.push(end);
            break;
        case 'week':
        default:
            dateSegment.push(DateUtil.getFirstDayWeek());
            dateSegment.push(DateUtil.getNowDate());
            break;
    }
    return dateSegment;
}

module.exports = router;