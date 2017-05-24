var router = require('express').Router();

var groupsModel = require('../../models/groups');
var validateWithSchema = require('../../utils').validateWithSchema;

router.route('/groups')
    /**
     * @api {post} /groups Add a new group
     * @apiVersion 0.1.0
     * @apiName addGroup
     * @apiGroup groups
     * @apiPermission private
     *
     * @apiDescription Add a new group for a user that is a list of his/her friends.
     *
     * @apiParam {String{1..25}} name Group's name
     * @apiParam {String[]} members List of user's friends username separated with space.
     *
     * @apiExample {json} Request-Example
     *     {
     *         "name": "دوستان نزدیک",
     *         "members": "ali vahid"
     *     }
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 201 Created
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_25
     *
     * @apiError (400) members:empty
     *
     * @apiError (400) less_than_two_members A group must at least have two members
     * @apiError (400) group_already_exists User already has a group with given name
     * @apiError (400) username_USERNAME_not_friend - `USERNAME` will replace with the username<br />- If username is the owner's username<br />- If username does not exists<br />- If username is not owner's friend
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *         "errors": ["username_ali_not_friend"]
     *     }
     */
    .post(
        // Input validation
        validateWithSchema(groupsModel.schema, 'all'),
        function (req, res) {
            groupsModel.add(
                req.user.id,
                req.body.name,
                req.body.members,
                function (err) {
                    if (err) {
                        switch (err) {
                            case 'serverError':
                                return res.status(500).end();
                            default:
                                return res.status(400).json({errors: [err]});
                        }
                    }
                    // Hooray! Group added successfully.
                    res.status(201).end();
                }
            );
        }
    );


module.exports = router;
