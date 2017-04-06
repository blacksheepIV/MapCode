var path = require('path');
var fs = require('fs');

var express = require('express');
var helmet = require('helmet');
var mustache = require('mustache');

var app = express();

app.use(helmet());

app.use('/api', require('./api'));

app.use(express.static(path.join(__dirname, 'public/')));

var mainHtmlAbPath = path.join(__dirname + '/public/main.html');
var mainHtml = '';

/*
 Reads public/main.html file and parses it with mustache package and then saves it
 in mainHtml variable.
 */
function parseMainHtml() {
    fs.readFile(mainHtmlAbPath, {encoding: 'utf-8'}, function(err, fileContent) {
        if (!err) {
            mainHtml = mustache.render(fileContent, {
                apiHref: process.env.API_HREF
            });
        }
        else {
            console.error("Can't read '%s'", mainHtmlAbPath);
        }
    });
}
parseMainHtml();

app.get('/*', function (req, res) {
    res.send(mainHtml);
});

/*
 Watches for changes in public/main.html file.
 */
function watchMainHtml() {
    fs.watch(mainHtmlAbPath, function(eventType) {
        if (eventType == 'change') {
            parseMainHtml();
        }
        watchMainHtml();
    });
}
watchMainHtml();

module.exports = app;
