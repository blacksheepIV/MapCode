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
    if (err.name === 'UnauthorizedError')
        return res.status(401).json({
            errors: ['auth_failure']
        });

    next(err);
};


module.exports.JWTErrorIgnore = function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') return next(); // Ignore the authentication error

    next(err);
};


/*
 Generates a new JWT and stores it in Redis

 Errors:
    - serverError
 */
module.exports.generateToken = function (userId, isMobile, callback) {
    var jti = randomstring.generate({length: 5});

    jsonwebtoken.sign({
        id: userId,
        jti: jti
    }, process.env.JWT_SECRET_CODE, {noTimestamp: true}, function (err, token) {
        // jsonwebtoken Error
        if (err) {
            console.error("generateToken@utils/jwt: jsonwebtoken: Error in generating a new JWT:\n\t%s", err);
            return callback('serverError');
        }

        redis.set(
            process.env.REDIS_PREFIX + 'user:' + userId + (isMobile === true ? ':mtoken' : ':wtoken'),
            jti,
            // Redis error
            function (err) {
                if (err) {
                    callback('serverError');
                    return console.error('generateToken@utils/jwt: Redis: Error in setting JWT key for new generated JWT:\n\t%s', err);
                }

                // Token successfully generated
                callback(null, token);
            }
        );
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


/**
 * A middleware that checks if the user is signed-in and also an admin.
 */
module.exports.checkAdmin =  function (req, res, next) {
    if (req.user && req.user.isAdmin)
        return next();

    return res.status(401).json({
        errors: ['auth_failure']
    });
};
