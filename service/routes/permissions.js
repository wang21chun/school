var express = require('express');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
var router = express.Router();

router.get('/getPermissions', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "select * from permissions";
    DB.QueryList(sql, [])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        });
});


router.post('/savePermissions', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "INSERT INTO `permissions` (`label`,`value`,`module`,`icon`,`type`) VALUES ? ";
    let values = [params.label, params.value, params.module,params.icon,params.type];
    DB.Insert(sql, [
            [values]
        ])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result.insertId));
        });
});



router.get('/getDeviceType', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "SELECT * FROM device_type ";
    DB.Insert(sql, [])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        });
});


module.exports = router;