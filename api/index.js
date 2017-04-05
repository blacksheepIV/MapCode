var fs = require('fs');
var path = require('path');

var router = require('express').Router();
var jwt = require('../utils/jwt');


/*
 Returns absolute path of all files in the directory

 dir : string : relative path of directory
 */
function getDirJsFiles(dir) {
    // List of all js files in the directory
    var jsFiles = [];
    // Directory's absolute path
    var dirAbPath = path.join(__dirname, dir);
    fs.readdirSync(dirAbPath)
        .forEach(function (file) {
            if (file.endsWith('.js')) {
                jsFiles.push(path.join(dirAbPath, file));
            }
        });

    return jsFiles;
}

getDirJsFiles('/public/').forEach(function (public_api) {
    router.use(require(public_api));
});

getDirJsFiles('/private/').forEach(function (private_api) {
    router.use(jwt.JWTCheck,
        require(private_api),
        jwt.JWTErrorHandler);
});

module.exports = router;
