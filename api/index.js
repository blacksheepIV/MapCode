var fs = require('fs');
var path = require('path');

var router = require('express').Router();
var jwt = require('../utils/jwt');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');


router.use(bodyParser.json());

router.use(expressValidator());

/*
 Invalid JSON error handler
 */
router.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({
            error: "Invalid JSON"
        });
    }
    else
        next(err);
});

router.use(function (req, res, next) {
    req.validateBodyWithSchema = function (schema, params, callback) {
        newSchema = {};
        params.forEach(function (param) {
            newSchema[param] = schema[param];
        });

        req.checkBody(newSchema);

        req.getValidationResult().then(function (result) {
            // Parameters are not valid
            if (!result.isEmpty()) {
                errorMessages = {};
                resultArray = result.array();
                for (var i = 0; i < resultArray.length; i++) {
                    if (typeof errorMessages[resultArray[i].param] === 'undefined')
                        errorMessages[resultArray[i].param] = [];
                    errorMessages[resultArray[i].param].push(resultArray[i].msg);
                }

                res.status(400).json({
                    errors: errorMessages,
                });
            }
            else {
                callback();
            }
        });
    };

    next();
});

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
