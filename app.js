var express = require('express');

var originRefererChecker = require('./middlewares/origin-referer-checker');

var app = express();

app.use(originRefererChecker);

app.get('/', function (req, res) {
    res.send('hello there!');
});

module.exports = app;
