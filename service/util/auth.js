const RedisDB = require("../db/redisDB");
const RESPONSE = require("./response");
const exceptions = ['/users/login', '/users/getCode', '/users/loginOut','/users/getUser'];
const suffix=/(\.html|\.ico|\.jpg|\.gif|\.jpeg|\.png|\.js|\.css|\.map)$/g;
module.exports = (err, req, res, next) => {
    console.log(suffix.test(req.path),req.path);
    if (suffix.test(req.path) || exceptions.includes(req.path)) {
        next();
    } else {
        let sessionId = req.cookies._id;
        console.log("sessionId", sessionId);
        RedisDB.get(sessionId)
            .then(data => {
                if (undefined === data || 0 >= +data) {
                    res.json(RESPONSE.NOAUTH())
                } else {
                    next();
                }
            });
    }
};