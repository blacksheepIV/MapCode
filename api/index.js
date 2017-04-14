var fs = require('fs');
var path = require('path');

var router = require('express').Router();
var jwt = require('../utils/jwt');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var validator = require('validator');

router.use(bodyParser.json());

router.use(expressValidator({
    customValidators: {
        isPersianString: function (str) {
            if (typeof str !== 'string')
                return false;

            return /^(ء|أ|آ|ا|ب|پ|ت|ث|ج|چ|ح|خ|د|ذ|ر|ز|ژ|س|ش|ص|ض|ط|ظ|ع|غ|ف|ق|ک|گ|ل|م|ن|و|ه|ی| |‌)+$/
                .test(str);
        },
        isDate: function (str) {
            if (isNaN(Date.parse(str)))
                return false;

            return true;
        },
        isUsername: function (str) {
            return /^[a-zA-Z]([a-zA-Z-0-9]|_)*$/.test(str);
        },
        isOneOf: function (str, values) {
            return values.includes(String(str));
        }
    }
}));

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
    if (typeof req.body !== 'object' || Array.isArray(req.body))
        res.status(400).json({
            error: "Request's body must be JSON object"
        });
    else
        next();
});

router.use(function (req, res, next) {
    req.validateBodyWithSchema = function (schema, params, callback) {
        var newSchema = {};

        if (params === 'all') {
            params = Object.keys(schema)
        }

        params.forEach(function (param) {
            newSchema[param] = schema[param];
        });


        if (schema.ignorables !== undefined) {
            for (var i = 0; i < schema.ignorables.length; i++) {
                if (req.body[schema.ignorables[i]] === undefined) {
                    delete newSchema[schema.ignorables[i]];
                }
            }

            delete newSchema['ignorables'];
        }

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
                    errors: errorMessages
                });
            }
            else {
                for (var param in req.body) {
                    if (newSchema[param] === undefined)
                        delete req.body[param];
                }

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
