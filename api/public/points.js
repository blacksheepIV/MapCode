var router = require('express').Router();
var lodashFilter = require('lodash/filter');
var mysqlFormat = require('mysql').format;
var lodashIntersection = require('lodash/intersection');
var lodashTrim = require('lodash/trim');

var db = require('../../db');
var jwt = require('../../utils/jwt');
var escapeRegExp = require('../../utils').escapeRegExp;
var pointsModel = require('../../models/points');
var validateWithSchema = require('../../utils').validateWithSchema;
var customFielder = require('../../utils').customFielder;
var startLimitChecker = require('../../utils').startLimitChecker;


/**
 * @api {get} /points/categories/ Get point categories
 * @apiVersion 0.1.0
 * @apiName getPointCategories
 * @apiGroup points
 * @apiPermission public
 *
 * @apiSuccessExample {json}
 *     Request-Example:
 *          GET http://mapcode.ir/api/points/categories/
 *
 *     Response-Example:
 *          HTTP/1.1 200 OK
 *
    {
      "فرهنگ و هنر": [
     {
       "name": "مکان تاريخي",
       "id": 2
     },
     {
       "name": "تالار نمايش و آمفي تاتر",
       "id": 3
     },
     {
       "name": "سينما",
       "id": 4
     }
     ]
     }
  *
  */
router.get('/points/categories/', function (req, res) {
    db.conn.query(
        "SELECT * FROM `point_categories`",
        function (err, results) {
            // MySQL error
            if (err) {
                res.status(500).end();
                return console.error("{GET}/points/categories: Error in getting point categories: %s", err);
            }

            var categories = {};
            var mapParentIdName = {};

            lodashFilter(results, {parent: null})
                .forEach(function (parent) {
                    categories[parent.name] = [];
                    mapParentIdName[parent.id] = parent.name;
                });

            results.forEach(function (result) {
                if (result.parent !== null) {
                    categories[mapParentIdName[result.parent]].push({
                        name: result.name,
                        id: result.id
                    });
                }
            });

            res.json(categories);
        }
    );
});


router.use('/points/search/',
    jwt.JWTCheck,
    jwt.JWTErrorIgnore
);

router.use('/points/search',
    require('../../utils').startLimitChecker
);

/**
 * @api {get} /points/search Search points
 * @apiVersion 0.1.0
 * @apiName pointSearch
 * @apiGroup points
 * @apiPermission public
 *
 * @apiDescription if user is not logged in search is getting done only in public points but
 * if the use is logged in search is getting done in public points and user's own private points
 * and user's friends private points.<br />In this search API, despite the requester only points's
 * public fields are available.
 *
 * @apiParam {String} [code] Point's code.
 * @apiParam {String} [name] Point's name.
 * @apiParam {String[]} [tags] Points' tags. Should be separated with space(' ').
 * @apiParam {String} [city] Points' city.
 * @apiParam {String} [owner] Point's owner username.
 * @apiPAram {String} [category] Point's category.
 *
 * @apiParam {Number{1..}} [start=1] Send points from start-th point!
 * @apiParam {Number{1..100}} [limit=100] Number of points to receive.
 *
 * @apiParam {String[]} [fields] Can be composition on these (separated with comma(',')): lat, lng, name, phone, province, city, code, address, public, owner, rate, popularity, category, description, tags
 *
 * @apiExample Request-Example
 *     GET http://mapcode.ir/api/points/search?name=آر&tags=food restaurant
 *
 * @apiExample Request-Example
 *     GET http://mapcode.ir/api/points/search?code=mp001002&start=10&limit=20
 *
 * @apiExample Request-Example
 *     GET http://mapcode.ir/api/poinst/search?city=kashan&fields=lat,lng
 *
 *
 * @apiError (404) no_results_found
 */
router.get('/points/search/',
    startLimitChecker,

    function (req, res) {
        var fields = pointsModel.publicFields;
        // If request just wants specific fields
        if (req.query.fields) {
            fields = lodashIntersection(
                req.query.fields.split(',').map(lodashTrim),
                pointsModel.publicFields
            );
            fields = fields.map(db.conn.escapeId);
        }

        var hasCond = false;
        var query = "SELECT " + fields.join(', ') + " FROM `points_detailed`";

        function checkQueryParam(subQuery, field, value) {
            if (req.query[field]) {
                query += (hasCond ? " AND " : " WHERE ") + mysqlFormat(subQuery, [field, value]);
                hasCond = true;
            }
        }

        checkQueryParam("?? LIKE ?", 'code', '%' + req.query.code + '%');

        checkQueryParam("?? LIKE ?", 'name', '%' + req.query.name + '%');

        checkQueryParam("?? REGEXP ?", 'tags',
            req.query.tags ? req.query.tags.split(' ').filter(function (tag) {
                // Remove empty string tags
                return tag.trim() !== '';
            })
                .map(escapeRegExp) // Escape tags to insert them in regular expression
                .join('|') : null);

        checkQueryParam("?? LIKE ?", 'city', '%' + req.query.city + '%');

        checkQueryParam("?? LIKE ?", 'owner', '%' + req.query.owner + '%');

        checkQueryParam("?? LIKE ?", 'category', '%' + req.query.category + '%');


        // If request is not authenticated just search in public points
        if (!req.user) {
            query += (hasCond ? " AND " : " WHERE ") + "`public` = TRUE";
        }
        // If request is authenticated search in public points + user's and his/her friends private points
        else {
            var cond = "(public = TRUE OR `owner_id` = ? OR EXISTS (SELECT * FROM `friends` WHERE (first_user = ? and second_user = owner_id) OR (second_user = ? AND first_user = owner_id)))";
            query += (hasCond ? " AND " : " WHERE ") + mysqlFormat(cond, [req.user.id, req.user.id, req.user.id]);
        }

        query += mysqlFormat(" AND (DATEDIFF(`expiration_date`, CURDATE()) >= -3 OR `owner_id` = ?)", [req.user ? req.user.id : null]);

        db.conn.query(
            query += " LIMIT " + db.conn.escape(req.queryStart) + ", " + db.conn.escape(req.queryLimit),
            function (err, results) {
                if (err) {
                    console.error("Error happened in {GET}/points/search:\n\t\t%s\n\tQuery:\n\t\t%s", err, query);
                    return res.status(500).end();
                }

                // If no record found, return 404 HTTP status code
                if (results.length === 0)
                    return res.status(404).json({errors: ['no_results_found']});

                res.json(results);
            }
        );
    });


/**
 * @api {get} /points/:code Get a point's info
 * @apiVersion 0.1.0
 * @apiName pointGet
 * @apiGroup points
 * @apiPermission public
 *
 * @apiDescription If user is not signed in, only public points are accessible but
 * if user is signed in, his/her own private points and his/her friends private points
 * are also accessible.
 *
 * @apiParam {String} [code] Point's code
 * @apiParam {String[]} [fields] Can be composition on these (separated with comma): lat, lng, name, phone, province, city, code, address, public, owner, rate, popularity, category, description, tags and if it's user's own point can include submission_date, expiration_date too.
 *
 * @apiExample
 *     Request-Example
 *         GET http://mapcode.ir/api/points/mp001004000000002?fields=name,lat,lng
 *     Response-Example
 *         HTTP/1.1 200 OK
 *
 *         {
 *           "lat": 21.32,
 *           "lng": 10.12,
 *           "name": "شرکت آرشین"
 *         }
 *
 * @apiError (400) not_valid_point_code
 *
 * @apiError (400) point_not_found
 */
router.get('/points/:code',
    validateWithSchema({code: {isPointCode: {errorMessage: 'not_valid_point_code'}}}, 'all', null, 'checkParams'),

    jwt.JWTCheck,
    jwt.JWTErrorIgnore,

    customFielder('query', 'fields', pointsModel.publicFields.concat(pointsModel.ownerFields), true),

    function (req, res) {
        pointsModel.getDetailedWithRequesterUser(
            req.user,
            req.params.code,
            req.queryFields,
            function (err, pointDetails) {
                // serverError
                if (err) return res.status(500).end();
                // Point not found
                if (!pointDetails) return res.status(404).json({errors: ['point_not_found']});

                res.send(pointDetails);
            }
        );
    }
);


module.exports = router;
