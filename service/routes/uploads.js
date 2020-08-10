var express = require('express');
var path = require('path');
var multer = require('multer')
const CRYPTO = require("../util/crypto");
const uploadPath = path.join(__dirname, '../public/uploads')
const RESPONSE = require("../util/response");
var router = express.Router();

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function(req, file, cb) {
        let arry = file.originalname.split(".");
        cb(null, CRYPTO.md5(file.originalname).substring(8,24) + "." + arry[arry.length - 1])
    }
})

var upload = multer({ storage: storage });

/* GET home page. */
router.post('/', upload.array("photos", 10), function(req, res, next) {
    let params = req.body;
    console.info("入参:", req.files);
    res.json(RESPONSE.SUCCESS(req.files.map(o => o.filename)))
});


module.exports = router;