var router = require('express').Router();
var lodashFilter = require('lodash/filter');
var mysqlFormat = require('mysql').format;

var db = require('../../db');
var jwt = require('../../utils/jwt');
var escapeRegExp = require('../../utils').escapeRegExp;


router.use(require('../../utils').startLimitChecker);

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


router.get('/point/search/', function (req, res) {
    var hasCond = false;
    var query = "SELECT * FROM `points_detailed_owner_id`";

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
        var cond = "(public = TRUE  OR exists ( select * from friends where (first_user = ? and second_user = owner) or (second_user = ? and first_user = owner)))";
        query += (hasCond ? " AND " : " WHERE ") + mysqlFormat(cond, [req.user.userId, req.user.userId]);
    }


    db.conn.query(
        query += " LIMIT ?, ?",
        [req.queryStart, req.queryLimit],
        function (err, results) {
            if (err) {
                console.log("Error happened in point search with query: \"%s\"\nError: %s", query, err);
                return res.status(500).end();
            }

            // If no record found, return 404 HTTP status code
            if (results.length === 0)
                return res.status(404).end();

            res.json(results);
        }
    );
});


module.exports = router;
