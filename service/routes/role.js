var express = require('express');
const DB = require("../db/mysqlDB");
const RESPONSE = require("../util/response");
var router = express.Router();

router.get('/getRoles', function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = "select * from role";
    DB.QueryList(sql,[])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result));
        });
});


module.exports = router;