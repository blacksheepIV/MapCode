var path = require('path');

var jwt = require('express-jwt');

require('dotenv').config({path: path.join(__dirname, '/.env')});

var redis = require('redis'),
    redis_client = redis.createClient();


module.exports = {
    JWTCheck: jwt({
        secret: process.env.JWT_SECRET_CODE,
        getToken: function fromHeaderOrQuerystring(req) {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                return req.headers.authorization.split(' ')[1];
            }
            return null;
        },
        isRevoked: function (req, payload, done) {
            redis_client.get(process.env.REDIS_PREFIX + 'user:' + payload.userCode + ':wtoken',
                function (err, reply) {
                    if (err) {
                        done(err);
                        return;
                    }
                    if (reply !== null) {
                        if (payload.jti == reply) {
                            done(null, false);
                            return;
                        }
                    }
                    redis_client.get(process.env.REDIS_PREFIX + 'user:' + payload.userCode + ':mtoken',
                        function (err, reply) {
                            if (err) {
                                done(err);
                                return;
                            }
                            if (reply !== null) {
                                if (payload.jti == reply) {
                                    done(null, false);
                                    return;
                                }
                            }
                            done(null, true);
                        }
                    )
                }
            )
        }
    }),
    JWTErrorHandler: function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).end();
        }
    }
};