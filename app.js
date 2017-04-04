var express = require('express');
var helmet = require('helmet');

var originRefererChecker = require('./middlewares/origin-referer-checker');


var app = express();

app.use(helmet());

app.use(originRefererChecker);

app.get('/', function (req, res) {
    res.send('hello there!');
});

module.exports = app;
