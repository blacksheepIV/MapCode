process.env.NODE_ENV = 'test';
process.env.REDIS_PREFIX = 'projectmtest';

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../../../app');
var redis = require('../../../utils/redis');
var smsModel = require('../../../models/sms');

var should = chai.should();


chai.use(chaiHttp);


describe('SMS', function () {
    describe('When given invalid phone number', function () {
        it('should give validation error for mobile_phone', function (done) {
            chai.request(server)
                .post('/api/sms')
                .send({})
                .end(function (err, res) {
                    res.should.have.status(400);
                    res.should.be.json;
                    res.body.should.be.a('object');
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property('mobile_phone');
                    res.body.errors.mobile_phone.should.be.a('array');
                    res.body.errors.mobile_phone.should.include('empty');
                    res.body.errors.mobile_phone.should.include('not_numeric');
                    res.body.errors.mobile_phone.should.include('length_not_11');

                    done();
                });
        });
    });

    describe('when given valid new phone number', function () {
        it('should successfully generate verification code', function (done) {
            var mobile_phone = '09365788764';

            chai.request(server)
                .post('/api/sms')
                .send({mobile_phone: mobile_phone})
                .end(function (err, res) {
                    res.should.have.status(200);

                    redis.del(smsModel.phoneNumberKey(mobile_phone));

                    done();
                });
        });
    });

    describe('when given multiple request within 120 seconds for same number', function () {
        it('should ignore request and respond an error', function (done) {
            var mobile_phone = '09375968744';

            chai.request(server)
                .post('/api/sms')
                .send({mobile_phone: mobile_phone})
                .end(function (err, res) {
                    chai.request(server)
                        .post('/api/sms')
                        .send({mobile_phone: mobile_phone})
                        .end(function (err, res) {
                            res.should.have.status(429);
                            res.should.be.json;
                            res.body.should.have.property('errors');
                            res.body.errors.should.be.a('array');
                            res.body.errors.should.include('mobile_phone_already_has_a_code');

                            redis.del(smsModel.phoneNumberKey(mobile_phone));

                            done();
                        });
                });
        });
    });
});
