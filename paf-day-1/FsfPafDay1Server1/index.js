// Step 1: Load required libraries.
require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const path = require('path');
const bodyParser = require("body-parser");

// Step 2: Create an instance of the application.
var app = express();

// Step 3: Setup Database connection.
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: process.env.DB_CONLIMIT,
    debug: true
});

// Step 4: Define closures.
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

// Step 5: Define SQL.
const sqlGetAllRsvps = "SELECT email, given_name, phone, attending, remarks FROM rsvp";
const sqlAddOneRsvp = "INSERT INTO rsvp ( email, given_name, phone, attending, remarks ) VALUES ( ? , ? , ? , ? , ? )";

// Step 6: Define call backs.
var getAllRsvps = makeQuery(sqlGetAllRsvps, pool);
var addOneRsvp = makeQuery(sqlAddOneRsvp, pool);

// Step 7: Define routes.
const API_URI = "/api";

// GET /api/rsvps
app.get(API_URI + "/rsvps", (req, res) => {
    console.log("GET /rsvps");
    getAllRsvps().then((results) => {
        res.format({
            'application/json': () => {
                res.status(200).json(results);
            },
            'default': () => {
                // log the request and respond with 406
                res.status(406).send('Not Acceptable');
            }
        });
    }).catch((error) => {
        console.error("Error Message: ", error);
        res.status(500).json({ error: error, status: 'error' });
    });
});

// POST /api/rsvp
app.post(API_URI + "/rsvp", bodyParser.urlencoded({ extended: true }), bodyParser.json(), (req, res) => {
    console.log("POST /rsvp");

    console.log("req: ", req.body);
    let emailValue = null;
    let given_nameValue = null;
    let phoneValue = null;
    let attendingValue = null;
    let remarksValue = null;
    if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
        console.log(req.get('content-type'));
        console.log('req.body.email: ', req.body.email);
        console.log('req.body.given_name: ', req.body.given_name);
        console.log('req.body.phone: ', req.body.phone);
        console.log('req.body.attending: ', req.body.attending);
        console.log('req.body.remarks: ', req.body.remarks);
        emailValue = req.body.email;
        given_nameValue = req.body.given_name;
        phoneValue = req.body.phone;
        attendingValue = req.body.attending;
        remarksValue = req.body.remarks;
    } else {
        res.status(400).json({ error: `Unable to service ${req.get('content-type')}`, status: 'error' });
        return;
    }

    let finalCriteriaFromType = [emailValue, given_nameValue, phoneValue, attendingValue, remarksValue];
    addOneRsvp(finalCriteriaFromType).then((results) => {
        res.format({
            'application/json': () => {
                res.status(200).json({ status: 'success' });
            },
            'default': () => {
                res.status(406).send('Not Acceptable');
            }
        });
    }).catch((error) => {
        console.error("Error Message: ", error);
        res.status(500).json({ error: error, status: 'error' });
    });
});

// Step 7.1: Serve static resources.
app.use(express.static(path.join(__dirname, 'public')));

// Step 7.2: Redirect to default page if no match.
app.use((req, resp) => {
    resp.redirect('/');
});

// Step 8: Start the server.
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;

pool.getConnection((err, conn) => {
    if (err) {
        console.error('ERROR: ', err);
        process.exit(-1);
    }
    conn.release();
    app.listen(PORT, () => {
        console.info('Application started on port %d at %s', PORT, new Date());
    });
})