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
                // Check if user have enough credit+bonus to submit a point
                db.getFromBy(
                    ['credit', 'bonus'],
                    'users',
                    {id: req.user.userId},
                    function (err, results) {
                        if (err) {
                            res.status(500).end();

                            console.error("MySQL: Error in getting credit and bonus of the user when adding new point: %s", err);
                        }
                        else {
                            if (results.length === 0) {
                                res.status(404).json({
                                    errors: ['user_not_exists']
                                });

                                console.error("!!!: A non existing user have passed auth and is requesting to submit a point!");
                            }
                            else {
                                if (results[0].credit + results[0].bonus <= 0) {
                                    res.status(400).json({
                                        errors: ['not_enough_credit_bonus']
                                    });
                                }
                                else
                                {
                                    var point = Object.assign({}, req.body);

                                    point.owner = req.user.userId;

                                    var date = new Date();
                                    point.submission_date = date;
                                    point.expiration_date = new Date(date.getTime());
                                    point.expiration_date.setFullYear(date.getFullYear() + 1);

                                    pointModel.addPoint(point, function (err, pointId) {
                                        if (err) {
                                            res.status(500).end();
                                        }
                                        else {
                                            var col = 'bonus';
                                            var col_value = results[0].bonus;
                                            if (col_value <= 0) {
                                                col = 'credit';
                                                col_value = results[0].credit;
                                            }

                                            // Decrease user's bonus or credit
                                            // TODO: bonus first or credit?
                                            db.conn.query(
                                                "UPDATE `users` SET ?? = ? WHERE `id` = ?",
                                                [col, col_value - 1, req.user.userId],
                                                function (err, results) {
                                                    if (err || results.affectedRows !== 1) {
                                                        res.status(500).end();

                                                        console.error("MySQL: Error in decreasing user's bonus or credit when adding new point: %s", err);

                                                        db.conn.query(
                                                            "DELETE FROM `points` WHERE `id` = ?",
                                                            pointId,
                                                            function (err, results) {
                                                                if (err || results.affectedRows !== 1) {
                                                                    console.error("MySQL: Error in removing point due to failure in decreasing user's bonus or credit when creating new point: %s", err);
                                                                }
                                                            }
                                                        );
                                                    }
                                                    else {
                                                        res.status(201).end();
                                                    }
                                                }
                                            );
                                        }
                                    });
                                }
                            }
                        }
                    }
                );
            }
        );
    });


module.exports = router;
