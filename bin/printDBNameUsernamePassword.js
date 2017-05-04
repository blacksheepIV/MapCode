#!/usr/bin/env node
var path = require('path');

require('dotenv').config({path: path.join(__dirname, '/../.env')});

console.log(
    process.env.DB_NAME + '\n' + process.env.DB_USER + '\n' + process.env.DB_PASS
);
