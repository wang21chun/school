const fs = require('fs')
const xlsx = require('node-xlsx');
const path = require('path');
const outPath = path.join(__dirname, '../public/excel/')
const DateUtil = require("../util/dateUtil")
const DEFAULT_DATE_TIME = "YYYYMMDDHHmmss";
const HEAD = ['维护点', '设备类型', '详细地址', '报修时间', '报修人', '故障描述', '维修人', '开始维修时间', '维修完成时间', '维修反馈'];
const ORDER_STATUS = {
    0: "等待维修",
    1: "维修中",
    2: "维修完成"
};
const DEVICE_TYPE = {
    '1': { label: "计算机报修", type: "MAINTAIN_COMPUTER" },
    '2': { label: "电工报修", type: "DG" },
    '3': { label: "木工报修", type: "MG" },
    '4': { label: "水工报修", type: "SG" }
};


function toRowData(maination, orderDetail) {
    let order = orderDetail.order;
    let createTime = DateUtil.format(order.createTime);
    let createUserName = order.user.name;
    let des = order.description || "";
    des = des.trim();
    let detail = [maination.get(order.maintainId), DEVICE_TYPE[order.deviceType].label, order.address, createTime,
        createUserName, des
    ];

    let progs = orderDetail.progs;
    if (progs.length > 0) {
        let repairUser = progs[0].repairUser;
        detail.push(repairUser.name);
        let actionTime = DateUtil.format(progs[0].createTime);
        detail.push(actionTime)
    }

    if (progs.length > 1) {
        let completeTime = DateUtil.format(progs[1].createTime);
        detail.push(completeTime)
        let desc = progs[1].description || "";
        desc = desc.trim();
        detail.push(desc);
    }

    return detail;
}
module.exports = {
    exportExcel: (statisticsData) => {

        let { maination, dataDuration, statistics } = statisticsData;
        let mainationMap = new Map();
        maination.forEach(o => {
            mainationMap.set(o.id, o.alias);
        });
        let datas = [];
        let row = 0;
        let ranges = [];
        datas.push(["统计日期", dataDuration.join("至")]);
        ranges.push({ s: { c: 1, r: row }, e: { c: 9, r: row } });
        row++;
        for (let i = 0; i < statistics.length; i++) {
            let o = statistics[i];
            datas.push([o.label]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;
            let data = o.data;
            datas.push(['总报修单', data.total, '等待维修', data.wait]);
            row++;
            datas.push(['维修完成', data.complete, '维修中', data.have]);
            row++;
            datas.push(['完成率', data.completionRate + "%", '平均耗时', data.avgUseTimeLabel]);
            row++;
            datas.push(HEAD);
            row++;
            let orders = data.orderDetails;
            datas.push(["等待维修"]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;
            let waitOrders = orders[0];
            if (waitOrders.length > 0) {
                waitOrders.forEach(o => {
                    datas.push(toRowData(mainationMap, o));
                    row++;
                });
            }
            datas.push([]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;

            datas.push(["维修中"]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;
            let haveOrders = orders[1];
            if (haveOrders.length > 0) {
                haveOrders.forEach(o => {
                    datas.push(toRowData(mainationMap, o));
                    row++;
                })
            }
            datas.push([]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;
            datas.push(["维修完成"]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;
            let completeOrders = orders[2];
            if (completeOrders.length > 0) {
                completeOrders.forEach(o => {
                    datas.push(toRowData(mainationMap, o));
                    row++;
                })
            }
            datas.push([]);
            ranges.push({ s: { c: 0, r: row }, e: { c: 9, r: row } });
            row++;
        }

        let cols = [{ wch: 35 }, { wch: 10 }, { wch: 50 }, { wch: 20 }, { wch: 8 }, { wch: 50 }, { wch: 8 }, { wch: 20 }, { wch: 20 }, { wch: 50 }]
        let options = { '!merges': ranges, '!cols': cols };


        let sheetName = DateUtil.getNowDate(DEFAULT_DATE_TIME);
        
        let buffer = xlsx.build([{ name: sheetName, data: datas }], options);
        let fileName = sheetName + '.xlsx';
        let filePath = path.join(outPath, fileName);
        fs.writeFileSync(filePath, buffer, 'binary');
        return fileName;
    }
}