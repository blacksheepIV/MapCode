var router = require('express').Router();
var lodashFilter = require('lodash/filter');

var db = require('../../db');

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
           "رستوران": [
             "رستوران ایتالیایی",
             "رستوران ژاپنی",
             "کبابی"
           ],
           "فروشگاه": [
             "فروشگاه لباس",
             "فروشگاه کفش"
           ]
         }
 *
 */
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
                        url: result.url
                    });
                }
            });

            res.json(categories);
        }
    );
});


module.exports = router;
