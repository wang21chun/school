const moment = require('moment');
const currentDayNum = new Map();
module.exports = {
    getNo: () => {
        let currentDayKey = moment().format("YYYYMMDD");
        let num = currentDayNum.get(currentDayKey);
        num = undefined === num ? 1 : ++num;
        currentDayNum.set(currentDayKey, num);
        return moment().format("YYYYMMDDHHmmssSSS")+num;
    }
}