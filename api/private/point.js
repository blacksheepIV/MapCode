var router = require('express').Router();

var pointModel = require('../../models/point');
var db = require('../../db');


router.route('/point')
// TODO: Point POST API docs
    .post(function (req, res, next) {
        req.validateBodyWithSchema(
            pointModel.schema,
            'all',
            function () {
                var point = Object.assign({}, req.body);

                point.owner = req.user.userId;

                var date = new Date();
                point.submission_date = date;
                point.expiration_date = new Date(date.getTime());
                point.expiration_date.setFullYear(date.getFullYear() + 1);

                pointModel.addPoint(point, function (err) {
                    if (!err) {
                        res.status(201).end();
                    }
                    else if (err === 'serverError') {
                        res.status(500).end();
                    }
                    else {
                        var statusCode = 404;
                        if (err === 'not_enough_credit_bonus')
                            statusCode = 400;
                        res.status(statusCode).json({
                            errors: [err]
                        });
                    }
                });
            }
        );
    });


module.exports = router;
