var path = require('path');
var fs = require('fs');

/*
 Returns absolute path of all files in the directory

 dir : string : relative path of directory
 */
module.exports.getDirJsFiles = function (baseDir, dir, callback) {
    // Directory's absolute path
    var dirAbPath = path.join(baseDir, dir);
    fs.readdir(dirAbPath, function (err, files) {
        if (!err) {
            // List of all js files in the directory
            var jsFiles = [];
            files.forEach(function (file) {
                if (file.endsWith('.js')) {
                    jsFiles.push(path.join(dirAbPath, file));
                }
            });
            callback(null, jsFiles);
        } else {
            callback('dirNotExists');
        }
    });
};


module.exports.skipLimitChecker = function (req, res, next) {
    req.queryStart = parseInt(req.query.start) - 1;
    if (isNaN(req.queryStart))
        req.queryStart = 0;


    req.queryLimit = parseInt(req.query.limit);
    if (isNaN(req.queryLimit))
        req.queryLimit = parseInt(process.env.QUERY_LIMIT_MAX);
    if (!req.queryLimit)
        req.queryLimit = 100;

    next();
};
