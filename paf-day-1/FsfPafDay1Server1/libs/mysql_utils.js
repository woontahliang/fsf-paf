const makeQuery = function (sql, pool) {
    console.log("makeQuery SQL: ", sql);

    return function (args) {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log("makeQuery args: ", args);
                console.log("makeQuery args is true or false: ", args ? "Is true" : "Is false");

                connection.query(sql, args || [], (err, results) => {
                    connection.release();
                    if (err) {
                        reject(err);
                        return;
                    }
                    console.log(">>> " + results);
                    resolve(results);
                });
            });
        });
    }
}

module.exports = { makeQuery };