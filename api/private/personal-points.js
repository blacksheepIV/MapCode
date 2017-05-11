var router = require('express').Router();

var personalPointsModel = require('../../models/personal-points');


/**
 * @api {post} /personal_points/ Create a new personal point
 * @apiVersion 0.1.0
 * @apiName personalPointSubmit
 * @apiGroup personal_points
 * @apiPermission private
 *
 * @apiDescription Creates a new personal point for user with given token.
 *
 * @apiParam {Decimal{10, 8}} lat Point's latitude
 * @apiParam {Decimal{11, 8}} lng Point's longitude
 * @apiParam {String{1..30}} name Point's name
 * @apiParam {String{1..21844}} [description]
 *
 * @apiExample {json} Request-Example
 *     {
 *         "lat": "21.323",
 *         "lng": "32.3343",
 *         "name": "پیتزا آرشین",
 *         "description": "یک توضیح"
 *     }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 201 Created
 *
 *     {
 *         "code": "10"
 *     }
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
 * @apiError (400) description:length_greater_than_21844
 */
router.post('/personal_points', function (req, res) {
    req.validateWithSchema(
        personalPointsModel.schema,
        'all',
        function () {
            // Add id of the token user to object to insert in DB
            req.body.owner = req.user.id;
            personalPointsModel.submit(req.body, function (err, code) {
                // serverError
                if (err)
                    return res.status(500).end();

                res.status(201).json({code: code});
            });
        },
        ['description']
    );
});


/**
 * @api {delete} /personal_points/:code Delete a personal point with given code.
 * @apiVersion 0.1.0
 * @apiName personalPointDelete
 * @apiGroup personal_points
 * @apiPermission private
 *
 * @apiDescription Deletes a personal point (with given code) for user with given token.
 * If given point does not belong to user, nothing will happen and 200 status code will get returned.
 *
 * @apiParam {Number} code Personal points' code
 *
 * @apiSuccessExample
 *     Request-Example:
 *         DELETE http://mapcode.ir/api/personal_points/10
 *     Response:
 *         HTTP/1.1 200 OK
 *
 *
 * @apiError (400) code:not_numeric
 */
router.delete('/personal_points/:code', function (req, res) {
    req.validateWithSchema(
        {
            'code': {
                isInt: {
                    errorMessage: 'not_numeric'
                }
            }
        },
        'all',
        // In case of successful validation
        function () {
            personalPointsModel.delete(
                req.user.id,
                req.params.code,
                function (err) {
                    // serverError
                    if (err)
                        return res.status(500).end();

                    res.status(200).end();
                }
            );
        },
        null, // Don't ignore any fields
        'checkParams'
    );
});


module.exports = router;
