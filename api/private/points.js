var router = require('express').Router();
var asyncEach = require('async/each');

var db = require('../../db');
var pointModel = require('../../models/points');
var validateWithSchema = require('../../utils').validateWithSchema;
var jwt = require('../../utils/jwt');


router.use(require('../../utils').startLimitChecker);


router.route('/points')
/**
 * @api {post} /points/ Create a new public/private point
 * @apiVersion 0.1.0
 * @apiName pointSubmit
 * @apiGroup points
 * @apiPermission private
 *
 * @apiDescription A signed-in user can submit a new public/private point if the user's
 * credit is bigger than 0.
 *
 * @apiParam {Decimal{10, 8}} lat Point's latitude
 * @apiParam {Decimal{11, 8}} lng Point's longitude
 * @apiParam {String{1..30}} name Point's name
 * @apiParam {Number{11}} phone Point's phone number
 * @apiParam {String{1..25}} province Point's province
 * @apiParam {String{1..25}} city Point's city
 * @apiParam {String{1..21844}} address Point's address
 * @apiParam {Number=0,1} public Point is public/private
 * @apiParam {String{1..30}} category
 * @apiParam {String{1..21844}} [description]
 * @apiParam {Array} [tags] Length + Sum(element.length) - 1 Should be lower than 21844
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
 *         "public": "1",
 *         "category": "رستوران ایتالیایی",
 *         "description": "یک توضیح",
 *         "tags": ["رستوران", "food"]
 *     }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 201 Created
 *
 *     {
 *         "code": "mp001002000000345"
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
 * @apiError (400) category:empty
 * @apiError (400) category:length_not_1_to_30
 *
 * @apiError (400) description:length_greater_than_21844
 *
 * @apiError (400) tags:length_greater_than_21844
 * @apiError (400) tags:not_array
 * @apiError (400) tags:tag_greater_than_40
 *
 * @apiError (404) category_not_found
 *
 *
 * @apiError (400) not_enough_credit
 *
 *
 */
    .post(
        validateWithSchema(pointModel.schema, 'all', ['description', 'tags']),

        function (req, res) {
            var point = Object.assign({}, req.body);

            point.owner = req.user.id;

            var date = new Date();
            point.submission_date = date;
            point.expiration_date = new Date(date.getTime());
            point.expiration_date.setFullYear(date.getFullYear() + 1);

            pointModel.add(point, function (err, pointCode) {
                if (err) {
                    if (err === 'serverError') {
                        res.status(500).end();
                    }
                    /* If there is no such a user in database
                       it means that token is in Redis
                       so let's remove the token from Redis
                       and return 401 Unauthorized error */
                    else if (err === 'owner_not_found') {
                        console.error("{POST}/points/: ! : Non-existent user have passed the token auth: token:\n\t%s", JSON.stringify(req.user));

                        res.status(401).json({
                            errors: ["auth_failure"]
                        });

                        return jwt.removeFromRedis(req.user.id);
                    }
                    else {
                        var statusCode = 404;
                        if (err === 'not_enough_credit')
                            statusCode = 400;
                        res.status(statusCode).json({
                            errors: [err]
                        });
                    }
                }
                else {
                    res.status(201).json({
                        code: pointCode
                    });
                }
            });
        }
    )
    /**
     * @api {get} /points/ Get current user's public/private points
     * @apiVersion 0.1.0
     * @apiName getUserPoints
     * @apiGroup points
     * @apiPermission private
     *
     * @apiDescription Get the token user's public/private points.
     * <br />If both 'expired' and 'non-expired' options are given, both will get returned.
     *
     * @apiParam {Number{1..}} [start=1] Send points from start-th point!
     * @apiParam {Number{1..100}} [limit=100] Number of points to receive.
     * @apiParam {Boolean} [private] Only send private points.
     * @apiParam {Boolean} [public] Only send public points (It will be ignored if `private` param is also set).
     * @apiParam {Boolean} [expired] Only expired points
     * @apiParam {Boolean} [non-expired] Only non-expired points
     *
     * @apiSuccessExample
     *     Request-Example:
     *         GET http://mapcode.ir/api/points/?private?start=1?limit=1
     *     Response:
     *        HTTP/1.1 200 OK
     *
     *        [
     *          {
     *            "lat": 24.32,
     *            "lng": 113.32,
     *            "submission_date": "2017-04-27T11:05:19.000Z",
     *            "name": "قصابی اصغرآفا و پسران",
     *            "phone": "03266118769",
     *            "province": "کرمان",
     *            "city": "کرمان",
     *            "code": "gLPQZOpnel5aKBzyVXvA",
     *            "address": "خیابان قسطنطنیه",
     *            "public": 0,
     *            "rate": 0,
     *            "popularity": 0,
     *            "category": "کبابی",
     *            "description": "یک توضیح!",
     *            "tags": "رستوران Food"
     *          }
     *        ]
     */
    .get(function (req, res) {
        var expiredOption = 'both';
        // Only expired option
        if (req.query.expired !== undefined)
            expiredOption = 'expired';
        // Onl non-expired option
        if (req.query['non-expired'] !== undefined)
            // If both options are given
            if (expiredOption === 'expired')
                expiredOption = 'both';
            else
                expiredOption = 'non-expired';

        var expiredCond = "";
        switch (expiredOption) {
            case 'non-expired':
                expiredCond = "AND DATEDIFF(`expiration_date`, CURDATE()) >= -3 ";
                break;
            case 'expired':
                expiredCond = "AND DATEDIFF(`expiration_date`, CURDATE()) < -3 ";
                break;
        }

        db.conn.query(
            "SELECT * FROM `points_detailed` " +
            "WHERE `owner_id` = ? " + expiredCond +
            (req.query.private !== undefined ? "AND `public` = FALSE " : (req.query.public !== undefined ? "AND `public` = TRUE " : "")) +
            "LIMIT ?, ?",
            [req.user.id, req.queryStart, req.queryLimit],
            function (err, results) {
                if (err) {
                    res.status(500).end();
                    return console.error("MySQL: Error in getting token user's points: %s", err);
                }

                // Remove `owner_id` field
                for (var i = 0; i < results.length; i++)
                    delete results[i].owner_id;

                res.json(results);
            }
        );

    });


module.exports = router;
