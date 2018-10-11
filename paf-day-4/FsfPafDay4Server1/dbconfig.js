/* create a module */
require('dotenv').config();

const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: parseInt(process.env.DB_CONLIMIT),
    debug: (process.env.DB_DEBUG === "true" ? true : false)
}

module.exports = config