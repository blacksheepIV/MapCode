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
            callback(jsFiles);
        } else {
            console.error("API Loader: Directory '%s' not exists.", dirAbPath);
        }
    });
};
