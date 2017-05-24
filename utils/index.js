var path = require('path');
var fs = require('fs');
var lodashIntersection = require('lodash/intersection');
var lodashTrim = require('lodash/trim');


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


module.exports.startLimitChecker = function (req, res, next) {
    req.queryStart = parseInt(req.query.start) - 1;
    if (isNaN(req.queryStart) || req.queryStart < 0)
        req.queryStart = 0;

    req.queryLimit = parseInt(req.query.limit);
    if (isNaN(req.queryLimit))
        req.queryLimit = parseInt(process.env.QUERY_LIMIT_MAX);
    if (!req.queryLimit || req.queryLimit < 1)
        req.queryLimit = 100;

    next();
};


module.exports.escapeRegExp = function(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};


module.exports.customFielder = function (type, name, fields, sep) {
    sep = sep || ',';

    return function (req, res, next) {
        var param = req[type][name];

        if (param) {
            req.queryFields = lodashIntersection(
                param.split(sep).map(lodashTrim),
                fields
            );
        }
        else {
            req.queryFields = '*';
        }

        next();
    };
};


module.exports.validateWithSchema = function (schema, params, ignorables, checkFunction) {
    return function (req, res, next) {
        var newSchema = {};

        if (params === 'all') {
            params = Object.keys(schema);
        }

        params.forEach(function (param) {
            newSchema[param] = schema[param];
        });

        if (checkFunction === undefined)
            checkFunction = 'checkBody';

        var checkField = checkFunction.substr(5).toLowerCase();

        if (ignorables) {
            if (ignorables === 'all')
                ignorables = params;
            for (var i = 0; i < ignorables.length; i++) {
                if (req[checkField][ignorables[i]] === undefined) {
                    delete newSchema[ignorables[i]];
                }
            }
        }

        req[checkFunction](newSchema);

        req.getValidationResult().then(function (result) {
            // Parameters are not valid
            if (!result.isEmpty()) {
                var errorMessages = {};
                var resultArray = result.array();
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
                for (var param in req[checkField]) {
                    if (newSchema[param] === undefined)
                        delete req[checkField][param];
                }

                next();
            }
        });
    };
};
