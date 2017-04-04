var path = require('path');

var express = require('express');
var helmet = require('helmet');


var app = express();

app.use(helmet());

app.use(express.static(path.join(__dirname, 'public/')));

app.get('/', function (req, res) {
    res.send('hello there!');
});

module.exports = app;
