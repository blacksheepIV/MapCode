var router = require('express').Router();
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var validator = require('validator');

var getDirJsFiles = require('../utils/').getDirJsFiles;
var jwt = require('../utils/jwt');

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
            // Convert param to string
            str = String(str);
            for (var i = 1; i < arguments.length; i++)
                if (arguments[i] ===  str)
                    return true;

            return false;
        },
        isDecimal: function(str, M, D) {
            str = String(str);

            var re = new RegExp('^-?[0-9]{1,' + (M - D) + '}(.[0-9]{1,' + D + '})?$');

            return re.test(str);
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
    req.validateBodyWithSchema = function (schema, params, callback, ignorables) {
        var newSchema = {};

        if (params === 'all') {
            params = Object.keys(schema)
        }

        params.forEach(function (param) {
            newSchema[param] = schema[param];
        });


        if (ignorables !== undefined) {
            for (var i = 0; i < ignorables.length; i++) {
                if (req.body[ignorables[i]] === undefined) {
                    delete newSchema[ignorables[i]];
                }
            }
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

getDirJsFiles(__dirname, '/public/', function (jsFiles) {
    jsFiles.forEach(function (public_api) {
        router.use(require(public_api));
    });
});

getDirJsFiles(__dirname, '/private/', function (jsFiles) {
    jsFiles.forEach(function (private_api) {
        router.use(
            jwt.JWTCheck,
            require(private_api),
            jwt.JWTErrorHandler
        );
    });
});

module.exports = router;
