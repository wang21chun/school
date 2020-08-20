const mysql = require('mysql');
const sqlUtil = require('../util/sqlUtil');
const config = require('../config.json')
const POLL = mysql.createPool({
    connectionLimit: 10,
    host: '47.92.3.212',
    port: 3306,
    user: config.db.user,
    password: config.db.password,
    database: 'school'
});



let QueryObject = (sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        console.info(sql, values);
        poll.query(sql, values, (err, results, fields) => {
            if (err) reject(err);
            else {
                if (0 < results.length)
                    resolve(results[0]);
                else
                    resolve({});
            }

        });
    });
};
let QueryList = (sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        console.info(sql, values);
        poll.query(sql, values, (err, results, fields) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};
let QueryPage = (sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        let countSql = sqlUtil.countSql(sql);
        console.info(sql, values);
        poll.query(countSql, values, (err, results, fields) => {
            if (err) reject(err);
            else {
                let count = results[0].count;
                let limitSql = sqlUtil.limitSql(sql);
                poll.query(limitSql, values, (err, results, fields) => {
                    if (err) reject(err)
                    else {
                        resolve({
                            total: count,
                            data: results
                        });
                    }
                })
            }
        })
    })
};
let Insert = (sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        poll.query(sql, values, (err, results, fields) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
};
let Update = (sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        poll.query(sql, values, (err, results, fields) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
};
let Delete = (sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        poll.query(sql, values, (err, results, fields) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
};
let Exec = (connection, sql, values) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results, fields) => {
            if (error) throw error;
            resolve(results);
        });
    })
};
let BeginTransaction = () => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        poll.getConnection((err, connection) => {
            if (err) throw err;
            connection.beginTransaction(err => {
                if (err) {
                    connection.release();
                    throw err;
                }
                resolve(connection);
            });
        });
    });
};
let UpdateOrder = (datas) => {
    let poll = POLL;
    return new Promise((resolve, reject) => {
        BeginTransaction()
            .then(connection => {
                let all = datas.map(o => {
                    return Exec(connection, o.sql, o.values);
                });
                Promise.all(all)
                    .then(results => {
                        connection.commit(err => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    reject(err)
                                });
                            }
                        });
                        connection.release();
                        resolve(results);
                    })
                    .catch(err => {
                        console.error(err);
                        connection.rollback(() => {
                            connection.release();
                            reject(err);
                        });

                    })
            })
            .catch(err => {
                console.error(err);
                reject(err)
            })

    });
}


module.exports = {
    QueryObject,
    QueryList,
    QueryPage,
    Insert,
    Update,
    Delete,
    UpdateOrder
};