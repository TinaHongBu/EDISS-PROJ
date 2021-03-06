/**
 * Created by Tina on 6/10/17.
 */

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var DB = require('../MySQLDB.js');

var router = express.Router();
const CONFIG = require('../config.json');
var auth = require('./authenticator.js');

// Parse JSON body and store result in req.body
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());

router.post('/login', function(req, res) {
    var query = `SELECT fname FROM ${CONFIG.user_table} WHERE username = "${req.body.username}" AND password = "${req.body.password}"`;

    DB.query(query, function(err, rows) {
        if(err) console.log(err);
        else {
            var string = JSON.stringify(rows);
            var json = JSON.parse(string);
            if(json.length === 0) {
                // console.log("No matching account found");
                res.send({"message": "There seems to be an issue with the username/password combination that you entered"});
            } else if (json.length === 1) {
                req.session.username = req.body.username;
                // console.log("User logged in: First Name: " + json[0].fname + ", Username: " + req.body.username);
                res.send({"message": `Welcome ${json[0].fname}`});
            }
        }
    });
});

router.post('/logout', auth.ensureLoggedIn, function(req, res, next) {
    req.session = null;
    // console.log("You have been successfully logged out");
    res.send({"message": "You have been successfully logged out"});
});

module.exports = router;
