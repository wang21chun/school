const express = require('express');
const DB = require("../db/mysqlDB");
const CRYPTO = require("../util/crypto");
const RESPONSE = require("../util/response");
const router = express.Router();

router.get("/getMaination", (req, res, next) => {
    let params = req.query;
    console.info("入参:", params);
    let sql = "select * from maintain where id=?";
    DB.QueryObject(sql, params.id)
        .then(result => {
            res.json(RESPONSE.SUCCESS(result))
        });
})
router.post("/searchList", function(req, res, next) {
    let params = req.body;
    console.info("入参:", params);
    let sql = ["select * from maintain"];

    let queryValue = [];

    let name = params.name || "";
    if ('' !== name) {
        queryValue.push(`${params.name}%`);
        sql.push("where alias like ?");
    }

    let page = params.page;
    queryValue.push((page.current - 1) * page.pageSize);
    queryValue.push(page.pageSize);

    DB.QueryPage(sql.join(" "), queryValue)
        .then(results => {
            Object.assign(page, results);
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
    let data = {
        pId: params.poi.id,
        alias:params.alias,
        name: params.poi.name,
        district: params.poi.district,
        adcode: params.poi.adcode,
        lng: params.poi.location.lng,
        lat: params.poi.location.lat,
        address: params.poi.address,
        typecode: params.poi.typecode,
    }
    if (undefined !== params.id && 0 < params.id) {
        let sql = "UPDATE maintain SET ? where id = ?";
        DB.Update(sql, [data, params.id])
            .then(result => {
                console.log(result);
                res.json(RESPONSE.SUCCESS(result.affectedRows));
            })
            .catch(err => {
                console.log(err)
                res.json(RESPONSE.ERROR(err))
            })

        return;
    }

    let sql = "INSERT INTO `maintain` SET ?";

    DB.Insert(sql, data)
        .then(result => {
            res.json(RESPONSE.SUCCESS(result.insertId));
        })
        .catch(err => {
            console.log(err)
            res.json(RESPONSE.ERROR(err))
        })
});
router.get("/deletes", (req, res, next) => {
    let params = req.query;
    console.info("入参:", params);
    let sql = "DELETE FROM maintain WHERE id in(?)";
    let ids = params.ids.split(",");
    if (0 == ids.length) {
        res.json(RESPONSE.ERROR("参数错误:未选择删除数据!"));
        return;
    }
    DB.Delete(sql, [ids])
        .then(result => {
            res.json(RESPONSE.SUCCESS(result.affectedRows));
        })
        .catch(err => {
            console.log(err)
            res.json(RESPONSE.ERROR(err))
        })
})


module.exports = router;