module.exports = {
    countSql: (sql) => {
        let fileds = sql.split(" ");
        let fromIndex = fileds.findIndex(element => "from" == element || "FROM" == element);
        fileds.splice(1, fromIndex - 1);
        fileds.splice(1, 0, "count(*) as count");
        return fileds.join(" ");
    },
    limitSql: (sql) => {
        return sql + " limit ?, ?";
    }

}
