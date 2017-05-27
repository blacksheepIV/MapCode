var router = require('express').Router();

var groupsModel = require('../../models/groups');
var messagesModel = require('../../models/messages');
var validateWithSchema = require('../../utils').validateWithSchema;
var customFielder = require('../../utils').customFielder;
var startLimitChecker = require('../../utils').startLimitChecker;


router.route('/groups')
    /**
     * @api {get} /groups Get user's groups list
     * @apiVersion 0.1.0
     * @apiName getUserGroups
     * @apiGroup groups
     * @apiPermission private
     *
     * @apiDescription Get list of user's groups.
     *
     * @apiParam {Number{1..}} [start=1] Get groups from start-th point!
     * @apiParam {Number{1..100}} [limit=100] Number of groups to receive.
     *
     * @apiParam {String[]} [fields] Can be composition of these (separated with comma(',')): name, members
     */
    .get(
        startLimitChecker,
        customFielder('query', 'fields', groupsModel.publicFields, true),
        function (req, res) {
            groupsModel.getUserGroups(
                req.user.id,
                req.queryFields,
                req.queryStart,
                req.queryLimit,
                function (err, groups) {
                    if (err) return res.status(500).end();

                    res.send(groups);
                }
            );
        }
    )
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
     * @apiParam {String[]} members List of user's friends username
     *
     * @apiExample {json} Request-Example
     *     {
     *         "name": "دوستان نزدیک",
     *         "members": ["ali", "vahid"]
     *     }
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 201 Created
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_25
     *
     * @apiError (400) members:empty
     * @apiError (400) members:not_array
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
                req.body.members.join(" "),
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


router.route('/groups/:name')
    /**
     * @api {post} /groups/:name Send group message
     * @apiVersion 0.1.0
     * @apiName sendGroupMessage
     * @apiGroup groups
     * @apiPermission private
     *
     * @apiDescription Send a message to all group members. Messages will
     * be sent like a normal message.
     *
     * @apiParam {String{1..25}} name Group's name
     *
     * @apiParam {String{17}} [point] A non-personal point code
     * @apiParam {Number} [personal_point] A personal point code
     * @apiParam {String{1..21844}} [message] Message's content
     *
     * @apiExample {json} Request-Example
     *     {
     *         "group": "فامیل",
     *         "point": "mp001002000000123",
     *         "message": "This is a good point!"
     *     }
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_25
     *
     * @apiError (400) point:empty A point should not be defined or it can't be empty
     * @apiError (400) point:not_valid_point_code A valid point code starts with 'mp' and continues with 15 digits.
     *
     * @apiError (400) personal_point:empty A personal point should not be defined or it can't be empty
     * @apiError (400) personal_point:numeric
     *
     * @apiError (400) personal_point_not_found Either there is no personal point with is id or it's now owned by user
     * @apiError (400) group_not_found
     * @apiError (400) sender_not_found !!! If you got this log out the user
     * @apiError (400) point_not_found Either there is no point with given code or it's private and not owned by user
     *
     * @apiError (400) no_point None of 'point' and 'personal_point' have given
     * @apiError (400) both_points Both 'point' and 'personal_point' have given
     */
    .post(
        // Validate group name
        validateWithSchema(groupsModel.schema, ['name'], null, 'checkParams'),
        // Validate inputs for sending message
        function (req, res, next) {
            req.validateWithSchema(messagesModel.schema, ['point', 'personal_point', 'message'], function () {
                // Check if no point or personal point is given
                if (!req.body.point && !req.body.personal_point)
                    return res.status(400).json({errors: ['no_point']});

                // Check if both point and personal point is given
                if (req.body.point && req.body.personal_point)
                    return res.status(400).json({errors: ['both_points']});

                // Inputs are fine, continue.
                next();
            }, 'all');
        },
        function (req, res) {
            groupsModel.sendMessage(
                req.user.id,
                req.params.name,
                req.body.point,
                req.body.personal_point,
                req.body.message,
                function (err) {
                    if (err) {
                        switch (err) {
                            case 'serverError':
                                return res.status(500).end();
                            default:
                                return res.status(400).json({errors: [err]});
                        }
                    }

                    // Hooray! Message successfully sent to group members!
                    res.status(200).end();
                }
            );
        }
    )
    /**
     * @api {get} /groups/:name Get a group's info
     * @apiVersion 0.1.0
     * @apiName getGroup
     * @apiGroup groups
     * @apiPermission private
     *
     * @apiDescription Get a user's group's info.
     *
     * @apiParam {String{1..25}} name Group's name
     *
     * @apiParam {String[]} [fields] Can be composition of these (separated with comma(',')): name, members
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_25
     *
     * @apiError (404) not_found
     *
     * @apiSuccessExample
     *     Request-Example:
     *         GET http://mapcode.ir/api/groups/mygp?fields=members
     *     Response:
     *         HTTP/1.1 200 OK
     *         {
     *             members: ["ali", "ahmad"]
     *         }
     */
    .get(
        customFielder('query', 'fields', groupsModel.publicFields, true),
        function (req, res) {
            groupsModel.getGroup(
                req.user.id,
                req.params.name,
                req.queryFields,
                function (err, gp) {
                    if (err) return res.status(500).end();

                    if (!gp) return res.status(404).end();

                    res.send(gp);
                }
            );
        }
    )
    /**
     * @api {delete} /groups/:name Delete user's group
     * @apiVersion 0.1.0
     * @apiName deleteGroup
     * @apiGroup groups
     * @apiPermission private
     *
     * @apiDescription Delete user's group with given name
     *
     * @apiParam {String{1..25}} name Group's name
     *
     * @apiExample Request-Example
     *     DELETE http://mapcode.ir/api/groups/فامیل
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_25
     */
    .delete(
        // Input validation
        validateWithSchema(groupsModel.schema, ['name'], null, 'checkParams'),
        function (req, res) {
            groupsModel.delete(
                req.user.id,
                req.params.name,
                function (err) {
                    if (err) {
                        return res.status(500).end();
                    }

                    // Hooray! Group has delete.
                    res.status(200).end();
                }
            );
        }
    )
    /**
     * @api {put} /groups/:name Update a group
     * @apiVersion 0.1.0
     * @apiName updateGroup
     * @apiGroup groups
     * @apiPermission private
     *
     * @apiDescription Update a group's name or members or both.
     *
     * @apiParam {String{1..25}} name Group's name
     *
     * @apiParam {String{1..25}} [new_name] Group's new name
     * @apiParam {String[]} [new_members] List of user's friends username
     *
     * @apiExample {json} Request-Example
     *     PUT http://mapcode.ir/api/groups/oldgp
     *     {
     *         "new_name": "newgp",
     *         "new_members": ["ali", "vahid"]
     *     }
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 Ok
     *
     * @apiError (400) name:empty
     * @apiError (400) name:length_not_1_to_25
     *
     * @apiError (400) new_name:empty
     * @apiError (400) new_name:length_not_1_to_25
     *
     * @apiError (400) new_members:empty
     * @apiError (400) new_members:not_array
     *
     * @apiError (400) group_not_exists User has no group with given name
     * @apiError (400) less_than_two_members A group must at least have two members
     * @apiError (400) group_already_exists User already has a group with given name
     * @apiError (400) username_USERNAME_not_friend - `USERNAME` will replace with the username<br />- If username is the owner's username<br />- If username does not exists<br />- If username is not owner's friend
     *
     * @apiErrorExample {json} Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *         "errors": ["username_ali_not_friend"]
     *     }
     *
     * @apiErrorExample {json}
     *     Request-Example:
     *         PUT http://mapcode.ir/groups/mygp
     *         {
     *             "new_name": "my new gp"
     *         }
     *     Response:
     *         HTTP/1.1 400 Bad Request
     *         {
     *             "errors": ["group_not_exists"]
     *         }
     */
    .put(
        // Params validation
        validateWithSchema(groupsModel.schema, ['name'], null, 'checkParams'),
        // Body validation
        validateWithSchema(groupsModel.updateSchema, 'all', ['new_name', 'new_members']),
        function (req, res, next) {
            if (!req.body.new_name && !req.body.new_members)
                return res.status(400).json({errors: ['no_update_field_defined']});

            next();
        },
        function (req, res) {
            groupsModel.update(
                req.user.id,
                req.params.name,
                req.body.new_name,
                req.body.new_members.join(" "),
                function (err) {
                    if (err) {
                        switch (err) {
                            case 'serverError':
                                return res.status(500).end();
                            default:
                                return res.status(400).json({errors: [err]});
                        }
                    }
                    // Hooray! Group updated successfully.
                    res.status(200).end();
                }
            );
        }
    );


module.exports = router;
