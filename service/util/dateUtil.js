const moment = require('moment');
const DEFAULT_DATE = "YYYY-MM-DD 00:00:00";
const DEFAULT_DATE_LAST = "YYYY-MM-DD 23:59:59";
const DEFAULT_DATE_TIME = "YYYY-MM-DD HH:mm:ss";
module.exports = {
    DEFAULT_DATE:DEFAULT_DATE,
    DEFAULT_DATE_LAST:DEFAULT_DATE_LAST,
    //获取当前日期
    getNowDate: (format) => {
        return moment().format(format || DEFAULT_DATE_TIME)
    },
    //获取本周第一天日期
    getFirstDayWeek: (format) => {
        let day = moment().day();
        //当前为周日时转换为第7天
        day = 0 == day ? 7 : day;
        return moment().subtract(day - 1, 'days').format(format || DEFAULT_DATE);
    },
    //获取本月第一天日期
    getFirstDayMonth: (format) => {
        return moment().date(1).format(format || DEFAULT_DATE);
    },
    //获取本年第一天日期
    getFirstDaYear: (format) => {
        return moment().month(0).date(1).format(format || DEFAULT_DATE);
    },
    //获取上一月开始与结束
    getPreviousMonthDuration() {
        let previousMonth = moment().month(moment().month() - 1);
        let start = previousMonth.startOf('month').format(DEFAULT_DATE)
        let end = previousMonth.endOf('month').format(DEFAULT_DATE_LAST);
        return [start, end];
    },
    difference(first, second) {
        return moment(first).diff(moment(second));
    },
    format: (date, format) => {
        return moment(date).format(format || DEFAULT_DATE_TIME)
    }

}