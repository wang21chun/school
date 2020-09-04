const redis = require("redis");
const config = require('../config.json')
const redisConfig = config.redis
const client = redis.createClient({
    host: "47.92.3.212",
    port: 6379,
    connect_timeout: 60000,
    password: redisConfig.password,
    db: 0,
    prefix: 'computer_room'
});

client.on('error', function(err) {
    console.error('error event - ' + client.host + ':' + client.port + ' - ' + err);
});

function wrapKey(key){
    return "school:"+key
}

module.exports = {
    get: (key) => {
        return new Promise((resolve, reject) => {
            client.get(wrapKey(key), (err, res) => {
                if (err) reject(err);
                else resolve(res)
            })
        })
    },
    set: (key, value) => {
        return client.set(wrapKey(key), value, 'EX', 60*1000);
    },
    setEx:(key, value,seconds) => {
        return client.set(wrapKey(key), value, 'EX', seconds);
    },
    del:(key)=>{
       return client.del(wrapKey(key));
    }

};