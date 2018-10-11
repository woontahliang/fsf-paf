// Step 1: Load required libraries.
require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const path = require('path');
const bodyParser = require("body-parser");
const dbconfig = require('./dbconfig');
const utils = require('./libs/mysql_utils');

// Step 2: Create an instance of the application.
var app = express();

// Step 3: Setup Database connection.
console.log(dbconfig);
var pool = mysql.createPool(dbconfig);

// Step 4: Define closures.

// Step 5: Define SQL.
const sqlGetAllRsvps = "SELECT email, given_name, phone, attending, remarks FROM rsvp";
const sqlAddOneRsvp = "INSERT INTO rsvp ( email, given_name, phone, attending, remarks ) VALUES ( ? , ? , ? , ? , ? )";

// Step 6: Define call backs.
var getAllRsvps = utils.makeQuery(sqlGetAllRsvps, pool);
var addOneRsvp = utils.makeQuery(sqlAddOneRsvp, pool);

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

    console.log("req.body: ", req.body);
    let emailValue = null;
    let given_nameValue = null;
    let phoneValue = null;
    let attendingValue = null;
    let remarksValue = null;
    if (req.is('application/json') || req.is('application/x-www-form-urlencoded')) {
        console.log('\'content-type\':', req.get('content-type'));
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
pool.getConnection((err, conn) => {
    if (err) {
        console.error('ERROR: ', err);
        process.exit(-1);
    }
    conn.release();
    const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
    app.listen(PORT, () => {
        console.info('Application started on port %d at %s', PORT, new Date());
    });
})