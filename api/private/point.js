var router = require('express').Router();

var pointModel = require('../../models/point');


router.route('/point')
/**
 * @api {post} /point/ Create a new public/private point
 * @apiVersion 0.1.0
 * @apiName pointSubmit
 * @apiGroup point
 * @apiPermission private
 *
 * @apiDescription A signedin user can submit a new public/private point if the user's
 * credit+bonus is more than 0.
 *
 * @apiParam {Decimal{10, 8}} lat Point's latitude
 * @apiParam {Decimal{11, 8}} lng Point's longitude
 * @apiParam {String{1..30}} name Point's name
 * @apiParam {Number{11}} phone Point's phone number
 * @apiParam {String{1..25}} province Point's province
 * @apiParam {String{1..25}} city Point's city
 * @apiParam {String{1..21844}} address Point's address
 * @apiParam {Number=0,1} public Point is public/private
 *
 * @apiExample {json} Request-Example
 *     {
     *         "lat": "21.323",
     *         "lng": "32.3343",
     *         "name": "پیتزا آرشین",
     *         "phone": "03155447658",
     *         "province": "اصفهان",
     *         "city": "کاشان",
     *         "address": "خیابان امیرکبیر",
     *         "public": "1"
     *     }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 201 Created
 *
 *
 * @apiError (400) lat:empty
 * @apiError (400) lat:not_valid_latitude Latitude should be a decimal number with maximum of 2 non-fractional and maximum of 8 fractional digits
 *
 * @apiError (400) lng:empty
 * @apiError (400) lng:not_valid_longitude Longitude should be a decimal number with maximum of 3 non-fractional and 8 maximum of 8 fractional digits
 *
 * @apiError (400) name:empty
 * @apiError (400) name:length_not_1_to_30
 *
 * @apiError (400) phone:empty
 * @apiError (400) phone:not_numeric
 * @apiError (400) phone:length_not_11
 *
 * @apiError (400) province:empty
 * @apiError (400) province:length_not_1_to_25
 *
 * @apiError (400) city:empty
 * @apiError (400) city:length_not_1_to_25
 *
 * @apiError (400) address:empty
 * @apiError (400) address:length_greater_than_21844
 *
 * @apiError (400) public:empty
 * @apiError (400) public:not_0_or_1
 *
 *
 * @apiError (404) owner_not_found This is a bug! if this error got returned sign out the user.
 *
 * @apiError (400) not_enough_credit_bonus
 *
 *
 */
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
                        // TODO: Return point's code
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
