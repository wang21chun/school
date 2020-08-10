var express = require('express');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
var router = express.Router();

router.get('/getDeviceType', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "select * from device_type";
    DB.QueryList(sql, [])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        });
});

module.exports = router;