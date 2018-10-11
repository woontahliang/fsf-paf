// Step 1: Load required libraries.
require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const path = require('path');
const multer = require('multer');
const dbconfig = require('./dbconfig');
const utils = require('./libs/mysql_utils');

// Step 2: Create an instance of the application.
var app = express();

// Step 3: Setup Database connection.
console.log(dbconfig);
var pool = mysql.createPool(dbconfig);

// Step 4: Define closures.

// Step 5: Define SQL.
const sqlAddOneRsvp = "INSERT INTO rsvp ( email, given_name, phone, attending ) VALUES ( ? , ? , ? , ? )";

// Step 6: Define call backs.
var addOneRsvp = utils.makeQuery(sqlAddOneRsvp, pool);

// Step 7: Define routes.
const API_URI = "";

//use tmp as the temporary directory
const multipart = multer({ dest: path.join(__dirname, 'tmp') });

// POST /api/reply
// app.post('/upload', multipart.single('picture'), (req, resp) => {
app.post(API_URI + "/reply", multipart.single(), (req, res) => {
    console.log("POST /reply");

    console.log("req.body: ", req.body);
    let emailValue = null;
    let nameValue = null;
    let phoneValue = null;
    let attendingValue = null;
    if (req.is('multipart/form-data')) {
        console.log('\'content-type\':', req.get('content-type'));
        console.log('req.body._email: ', req.body._email);
        console.log('req.body._name: ', req.body._name);
        console.log('req.body._phone: ', req.body._phone);
        console.log('req.body._attending: ', req.body._attending);
        emailValue = req.body._email;
        nameValue = req.body._name;
        if (req.body._phone != "none") {
            phoneValue = req.body._phone;
        }
        attendingValue = req.body._attending;
    } else {
        res.status(400).json({ error: `Unable to service ${req.get('content-type')}`, status: 'error' });
        return;
    }

    let finalCriteriaFromType = [emailValue, nameValue, phoneValue, attendingValue];
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