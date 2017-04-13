process.env.NODE_ENV = 'test';
process.env.REDIS_PREFIX = 'projectmtest';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../../../app');
var redis = require('../../../utils/redis');

var should = chai.should();


chai.use(chaiHttp);


describe('SMS', function () {
    describe('When given invalid phone number', function () {
        it('should give validation error for phone_number', function (done) {
            chai.request(server)
                .post('/api/sms')
                .send({})
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('phone_number');
                    res.body.errors.phone_number.should.be.a('array');
                    res.body.errors.phone_number.should.include('empty');
                    res.body.errors.phone_number.should.include('not_int');
                    res.body.errors.phone_number.should.include('length_not_11');

                    done();
                });
        });
    });

    var phone_number = '09365788764';
    var redis_key = process.env.REDIS_PREFIX + 'mphone:' + phone_number;

    describe('when given valid new phone number', function () {
        it('should successfully generate verification code', function (done) {
            redis.del(redis_key, function (err) {
                if (err)
                    return done(err);

                chai.request(server)
                    .post('/api/sms')
                    .send({phone_number: phone_number})
                    .end(function (err, res) {
                        res.should.have.status(200);

                        redis.del(redis_key);

                        done();
                    });
            });
        });
    });

    describe('when given multiple request within 120 seconds for same number', function () {
        it('should ignore request and respond an error', function (done) {
            chai.request(server)
                .post('/api/sms')
                .send({phone_number: phone_number})
                .end(function (err, res) {
                    chai.request(server)
                        .post('/api/sms')
                        .send({phone_number: phone_number})
                        .end(function (err, res) {
                            res.should.have.status(429);
                            res.should.be.json;
                            res.body.should.have.property('errors');
                            res.body.errors.should.be.a('array');
                            res.body.errors.should.include('PhoneNumberAlreadyHasACode');

                            redis.del(redis_key);

                            done();
                        });
                });
        });
    });
});
