var jwt = require('express-jwt');
var jsonwebtoken = require('jsonwebtoken');
var randomstring = require('randomstring');

var redis = require('./redis');

module.exports.JWTCheck = jwt({
    secret: process.env.JWT_SECRET_CODE,
    getToken: function fromHeaderOrQuerystring(req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        }
        return null;
    },
    isRevoked: function (req, payload, done) {
        redis.get(process.env.REDIS_PREFIX + 'user:' + payload.userId + ':wtoken',
            function (err, reply) {
                if (err) {
                    done(err);
                    return;
                }
                if (reply !== null) {
                    if (payload.jti === reply) {
                        done(null, false);
                        return;
                    }
                }
                redis.get(process.env.REDIS_PREFIX + 'user:' + payload.userId + ':mtoken',
                    function (err, reply) {
                        if (err) {
                            done(err);
                            return;
                        }
                        if (reply !== null) {
                            if (payload.jti === reply) {
                                done(null, false);
                                return;
                            }
                        }
                        done(null, true);
                    }
                );
            }
        );
    }
});


module.exports.JWTErrorHandler = function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            errors: ['auth_failure']
        });
    }
    else {
        next(err);
    }
    else {
        next(err);
    }
};


module.exports.JWTErrorIgnore = function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        // Ignore the authentication error
        next();
    }
    else {
        next(err);
    }
};


/*
 Generates a new JWT and stores it in Redis

 Errors:
    - serverError
 */
module.exports.generateToken = function (userId, userCode, isMobile, callback) {
    var jti = randomstring.generate({length: 5});

    jsonwebtoken.sign({
        userId: userId,
        userCode: userCode,
        jti: jti
    }, process.env.JWT_SECRET_CODE, {noTimestamp: true}, function (err, token) {
        if (err) {
            callback('serverError');
            console.error("jsonwebtoken: Error in generating a new JWT: %s", err);
        }
        else {
            redis.set(
                process.env.REDIS_PREFIX + 'user:' + String(userId) + (isMobile === true ? ':mtoken' : ':wtoken'),
                jti,
                function (err, reply) {
                    if (err) {
                        callback('serverError');
                        console.error('Redis: Error in setting JWT key for new generated JWT in Signin: %s', err);
                    }
                    else {
                        callback(null, token);
                    }
                }
            );
        }
    });
};
