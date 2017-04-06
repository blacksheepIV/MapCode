var fs = require('fs');
var path = require('path');

var router = require('express').Router();
var jwt = require('../utils/jwt');
var bodyParser = require('body-parser');


router.use(bodyParser.urlencoded({
    extended: true
}));

/*
 Returns absolute path of all files in the directory

 dir : string : relative path of directory
 */
function getDirJsFiles(dir, callback) {
    // Directory's absolute path
    var dirAbPath = path.join(__dirname, dir);
    fs.readdir(dirAbPath, function (err, files) {
        if (!err) {
            // List of all js files in the directory
            var jsFiles = [];
            files.forEach(function (file) {
                if (file.endsWith('.js')) {
                    jsFiles.push(path.join(dirAbPath, file));
                }
            });
            callback(jsFiles);
        } else {
            console.error("API Loader: Directory '%s' not exists.", dirAbPath);
        }
    });
}

getDirJsFiles('/public/', function (jsFiles) {
    jsFiles.forEach(function (public_api) {
        router.use(require(public_api));
    });
});

getDirJsFiles('/private/', function (jsFiles) {
    jsFiles.forEach(function (private_api) {
        router.use(require(private_api));
    });
});

module.exports = router;
