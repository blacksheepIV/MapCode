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
    /*
     Checks if token is revoked or not

     Each user can only have two active token at a time.
     One for mobile device (called mtoken) and one for
     web application (called wtoken).
     Any new sign in from either mobile device or web application
     causes the existing token to get revoked.
     */
    isRevoked: function (req, payload, done) {
        redis.get(process.env.REDIS_PREFIX + 'user:' + payload.id + ':wtoken',
            function (err, reply) {
                if (err) return done(err);

                // If token's jti is a correct wtoken (web token)
                if (reply !== null && payload.jti === reply)
                    return done(null, false);

                // See if token is mtoken (mobile token)
                redis.get(process.env.REDIS_PREFIX + 'user:' + payload.id + ':mtoken',
                    function (err, reply) {
                        if (err)
                            return done(err);

                        if (reply !== null && payload.jti === reply)
                            return done(null, false);

                        // Token is revoked
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
module.exports.generateToken = function (userId, username, isMobile, callback) {
    var jti = randomstring.generate({length: 5});

    jsonwebtoken.sign({
        id: userId,
        username: username,
        jti: jti
    }, process.env.JWT_SECRET_CODE, {noTimestamp: true}, function (err, token) {
        if (err) {
            callback('serverError');
            console.error("jsonwebtoken: Error in generating a new JWT: %s", err);
        }
        else {
            redis.set(
                process.env.REDIS_PREFIX + 'user:' + userId + (isMobile === true ? ':mtoken' : ':wtoken'),
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


/*
 Removes redis keys associated with tokens for a user with given ID
 */
module.exports.removeFromRedis = function (userId) {
    var preKey = process.env.REDIS_PREFIX + 'user:' + userId;
    [preKey + ':wtoken', preKey + ':mtoken'].forEach(function (key) {
        redis.del(key);
    });
};
