var router = require('express').Router();

var personalPointsModel = require('../../models/personal-points');
var startLimitChecker = require('../../utils').startLimitChecker;
var validateWithSchema = require('../../utils').validateWithSchema;


/**
 * @api {post} /personal_points/ Create a new personal point
 * @apiVersion 0.1.0
 * @apiName submitPersonalPoint
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
router.post('/personal_points',
    // Validation
    validateWithSchema(personalPointsModel.schema, 'all', ['description']),

    function (req, res) {
        // Add id of the token user to object to insert in DB
        req.body.owner = req.user.id;
        personalPointsModel.submit(req.body, function (err, code) {
            // serverError
            if (err)
                return res.status(500).end();

            res.status(201).json({code: code});
        });
    }
);


/**
 * @api {delete} /personal_points/:code Delete a personal point with given code.
 * @apiVersion 0.1.0
 * @apiName deletePersonalPoint
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
router.delete('/personal_points/:code',
    // Validation
    validateWithSchema(
        {
            'code': {
                isInt: {
                    errorMessage: 'not_numeric'
                }
            }
        },
        'all', null, 'checkParams'
    ),

    function (req, res) {
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
    }
);


/**
 * @api {get} /personal_points/ Get list of personal points for a user
 * @apiVersion 0.1.0
 * @apiName getPersonalPoints
 * @apiGroup personal_points
 * @apiPermission private
 *
 * @apiParam {Number{1..}} [start=1] Send points from start-th point!
 * @apiParam {Number{1..100}} [limit=100] Number of points to receive.
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/api/personal_points
 *     Response:
 *        HTTP/1.1 200 OK
 *
 *        [
 *          {
 *            "code": 1,
 *            "lat": 24.32,
 *            "lng": 113.32,
 *            "name": "قصابی اصغرآفا و پسران",
 *            "description": "یک توضیح!"
 *          },
 *          {
 *            "code": 20,
 *            "lat": 42.12,
 *            "lng": 21.32,
 *            "name": "نقطه ی من",
 *            "description": "یک توضیح!"
 *          }
 *        ]
 */
router.get('/personal_points',
    startLimitChecker,
    function (req, res) {
        personalPointsModel.getForUser(
            req.user.id,
            req.queryStart,
            req.queryLimit,
            function (err, points) {
                // serverError
                if (err)
                    return res.status(500).end();

                return res.json(points);
            }
        );
    }
);


module.exports = router;
