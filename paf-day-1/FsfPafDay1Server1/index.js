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
var makeQuery = (sql, pool) => {
    console.log("makeQuery SQL: ", sql);

    return (args) => {
        let queryPromise = new Promise((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log("args: ", args);
                console.log("args is true or false: ", args ? "Is true" : "Is false");

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
        return queryPromise;
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
    if (req.is('application/json')) {
        emailValue = req.body.email;
        given_nameValue = req.body.given_name;
        phoneValue = req.body.phone;
        attendingValue = req.body.attending;
        remarksValue = req.body.remarks;
        console.log('application/json, emailValue: ', emailValue);
        console.log('application/json, given_nameValue: ', given_nameValue);
        console.log('application/json, phoneValue: ', phoneValue);
        console.log('application/json, attendingValue: ', attendingValue);
        console.log('application/json, remarksValue: ', remarksValue);
    } else if (req.is('application/x-www-form-urlencoded')) {
        emailValue = req.body.email;
        given_nameValue = req.body.given_name;
        phoneValue = req.body.phone;
        attendingValue = req.body.attending;
        remarksValue = req.body.remarks;
        console.log('application/x-www-form-urlencoded, emailValue: ', emailValue);
        console.log('application/x-www-form-urlencoded, given_nameValue: ', given_nameValue);
        console.log('application/x-www-form-urlencoded, phoneValue: ', phoneValue);
        console.log('application/x-www-form-urlencoded, attendingValue: ', attendingValue);
        console.log('application/x-www-form-urlencoded, remarksValue: ', remarksValue);
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
                // log the request and respond with 406
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

app.listen(PORT, () => {
    console.info(`Application started on port ${PORT}`);
});