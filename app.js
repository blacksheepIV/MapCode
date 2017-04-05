var path = require('path');
var fs = require('fs');

var express = require('express');
var helmet = require('helmet');
var mustache = require('mustache');


var app = express();

app.use(helmet());

app.use('/api', require('./api'));

app.use(express.static(path.join(__dirname, 'public/')));


var mainHtml = fs.readFileSync(path.join(__dirname + '/public/main.html'), 'utf8');
app.get('/*', function (req, res) {
    res.send(mustache.render(mainHtml, {
        apiHref: process.env.API_HREF
    }));
});

module.exports = app;
