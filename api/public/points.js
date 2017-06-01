var router = require('express').Router();
var lodashFilter = require('lodash/filter');
var mysqlFormat = require('mysql').format;
var lodashIntersection = require('lodash/intersection');
var lodashTrim = require('lodash/trim');

var db = require('../../db');
var jwt = require('../../utils/jwt');
var escapeRegExp = require('../../utils').escapeRegExp;
var pointModel = require('../../models/point');


/**
 * @api {get} /point/categories/ Get point categories
 * @apiVersion 0.1.0
 * @apiName getPointCategories
 * @apiGroup point
 * @apiPermission public
 *
 * @apiSuccessExample {json}
 *     Request-Example:
 *          GET http://mapcode.ir/api/categories/
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
// TODO: Cache system for /point/categories
// TODO: Async calculation
router.get('/point/categories/', function (req, res) {
    db.conn.query(
        "SELECT * FROM `point_categories`",
        function (err, results) {
            // MySQL error
            if (err) {
                res.status(500).end();
                return console.error("{GET}/point/categories: Error in getting point categories: %s", err);
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


router.use('/point/search/',
    jwt.JWTCheck,
    jwt.JWTErrorIgnore
);

router.use('/point/search',
    require('../../utils').startLimitChecker
);

/**
 * @api {get} /point/search Search points
 * @apiVersion 0.1.0
 * @apiName pointSearch
 * @apiGroup point
 * @apiPermission public
 *
 * @apiDescription if user is not logged in search is getting done only in public points but
 * if the use is logged in search is getting done in public points and user's own private points
 * and user's friends private points.
 *
 * @apiParam {String} [code] Point's code
 * @apiParam {String} [name] Point's name
 * @apiParam {String[]} [tags] Points' tags. Should be separated with space(' ').
 * @apiParam {String} [city] Points' city
 * @apiParam {String} [owner] Point's owner username
 * @apiPAram {String} [category] Point's category
 *
 * @apiParam {Number{1..}} [start=1] Send points from start-th point!
 * @apiParam {Number{1..100}} [limit=100] Number of points to receive.
 *
 * @apiParam {String[]} [fields] Can be composition on these (separated with comma(',')): lat, lng, submission_date, name, phone, province, city, code, address, public, owner, rate, popularity, category, description, tags
 *
 * @apiExample Request-Example
 *     GET http://mapcode.ir/api/point/search?name=آر&tags=food restaurant
 *
 * @apiExample Request-Example
 *     GET http://mapcode.ir/api/point/search?code=mp001002&start=10&limit=20
 *
 * @apiExample Request-Example
 *     GET http://mapcode.ir/api/point/search?city=kashan&fields=lat,lng
 *
 *
 * @apiError (404) no_results_found
 */
router.get('/point/search/', function (req, res) {
    var fields = pointModel.publicFields;
    // If request just wants specific fields
    if (req.query.fields) {
        fields = lodashIntersection(
            req.query.fields.split(',').map(lodashTrim),
            pointModel.publicFields
        );
        fields = fields.map(db.conn.escapeId);
    }

    var hasCond = false;
    var query = "SELECT " + fields.join(', ') + " FROM `points_detailed_with_owner_id`";

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
        var cond = "(public = TRUE  OR EXISTS (SELECT * FROM `friends` WHERE (first_user = ? and second_user = owner_id) OR (second_user = ? AND first_user = owner_id)))";
        query += (hasCond ? " AND " : " WHERE ") + mysqlFormat(cond, [req.user.id, req.user.id]);
    }


    db.conn.query(
        query += " LIMIT " + db.conn.escape(req.queryStart) + ", " + db.conn.escape(req.queryLimit),
        function (err, results) {
            if (err) {
                console.error("Error happened in point search with query: \"%s\"\nError: %s", query, err);
                return res.status(500).end();
            }

            // If no record found, return 404 HTTP status code
            if (results.length === 0)
                return res.status(404).json({errors: ['no_results_found']});

            res.json(results);
        }
    );
});


module.exports = router;
