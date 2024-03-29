var router = require('express').Router();
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var moment = require('moment');

var getDirJsFiles = require('../utils/').getDirJsFiles;
var jwt = require('../utils/jwt');

router.use(bodyParser.json());

router.use(expressValidator({
    customValidators: {
        isPersianString: function (str) {
            if (typeof str !== 'string')
                return false;
            /* jshint -W100 */
            return /^(ي|ء|أ|آ|ا|ب|پ|ت|ث|ج|چ|ح|خ|د|ذ|ر|ز|ژ|س|ش|ص|ض|ط|ظ|ع|غ|ف|ق|ک|گ|ل|م|ن|و|ه|ی| |‌)+$/
                .test(str);
        },
        isDate: function (str) {
            if (typeof str === 'string')
                return moment(str).isValid();
            else
                return moment(parseInt(str)).isValid();
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
        },
        isArray: function(field) {
            return Array.isArray(field);
        },
        strElemMaxLen: function (array, len) {
            for (var i = 0; i < array.length; i++)
                if (String(array[i]).length > len)
                    return false;

            return true;
        },
        isPointCode: function (code) {
            return /^((m|M)(p|P))[0-9]{15}$/.test(code);
        },
        isBigIntBetween: function (str, min, max) {
            return str >= min && str <= max;
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


getDirJsFiles(__dirname, '/public/', function (err, jsFiles) {
    if (!err) {
        jsFiles.forEach(function (public_api) {
            router.use(require(public_api));
        });
    }

    getDirJsFiles(__dirname, '/private/', function (err, jsFiles) {
        if (!err) {
            router.use(jwt.JWTCheck, jwt.JWTErrorHandler);
            jsFiles.forEach(function (private_api) {
                router.use(require(private_api));
            });
        }
    });
});


module.exports = router;
