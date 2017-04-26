#!/usr/bin/env node

var request = require('request');
var path = require('path');
var async = require('async');

require('dotenv').config({path: path.join(__dirname, '/../.env')});


var dummy_users = [
    {
        "name": "علیرضا",
        "melli_code": "1234567654",
        "email": "a.alireza@gmail.com",
        "date": "1996-02-05",
        "mobile_phone": "09368765417",
        "username": "alireza",
        "password": "123456",
        "type": "0",
        "__OPTIONAL__recommender_user": "1234567890"
    }
];

async.each(
    dummy_users,
    function (user, callback) {
        request.post({
            url: process.env.API_HREF + 'sms/',
            json: {
                mobile_phone: user.mobile_phone
            }
        }, function (err, res, body) {
            if (err) {
                return callback(error);
            }

            if (res.statusCode == 200) {
                user.sms_code = body.sms_code;
                request.post({
                    url: process.env.API_HREF + 'signup/',
                    json: user
                });
            }
        });
    },
    function (err) {
        if (err) {
            console.error("Failed to insert dummy users: %s", err);
        }
    }
);
