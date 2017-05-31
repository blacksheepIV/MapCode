var router = require('express').Router();

var friendsModel = require('../../models/friends');
var usersModel = require('../../models/users');
var validateWithSchema = require('../../utils').validateWithSchema;


/**
 * @api {post} /friends/:username Send friend request
 * @apiVersion 0.1.0
 * @apiName sendFriendRequest
 * @apiGroup friends
 * @apiPermission private
 *
 * @apiDescription Send a friend request to user with given username
 *
 * @apiParam {String{5..15}} username
 *
 * @apiSuccessExample
 *     Request-Example:
 *         POST http://mapcode.ir/api/friends/mohammad
 *     Response:
 *         HTTP/1.1 200 OK
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 *
 * @apiError (400) are_already_friends These two users are already friends
 * @apiError (400) already_request_pending There is already a pending friend request
 * @apiError (400) self_request User can't send a friend request for (him/her)self!
 * @apiError (400) username_not_found There is no user with given username
 */
router.post('/friends/:username', function (req, res) {
    req.validateWithSchema(usersModel.schema, ['username'], function () {
        friendsModel.sendRequest(
            req.user.id,
            req.params.username,
            function (err) {
                if (err) {
                    switch (err) {
                        case 'serverError':
                            return res.status(500).end();
                        default:
                            return res.status(400).json({errors: [err]});
                    }
                }

                // Request successfully sent
                res.status(200).end();
            }
        );
    }, null, 'checkParams');
});


/**
 * @api {post} /friends/accept/:username Accept friend request
 * @apiVersion 0.1.0
 * @apiName acceptFriendRequest
 * @apiGroup friends
 * @apiPermission private
 *
 * @apiDescription Accept a friend request that has been sent from a user with given username.
 *
 * @apiParam {String{5..15}} username
 *
 * @apiSuccessExample
 *     Request-Example:
 *         POST http://mapcode.ir/api/friends/accept/alireza
 *     Response:
 *         HTTP/1.1 200 OK
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 *
 * @apiError (400) your_not_requestee You can't accept a request that you have sent!
 * @apiError (400) no_pending_request There is no request from username.
 * @apiError (400) requestee_max_friends The user has maximum number of friends.
 * @apiError (400) requester_max_friends The user who has sent the request has maximum number of friends.
 * @apiError (400) username_not_found There is no user with given username.
 */
router.post('/friends/accept/:username', function (req, res) {
    req.validateWithSchema(usersModel.schema, ['username'], function () {
        friendsModel.acceptRequest(
            req.user.id,
            req.params.username,
            function (err) {
                if (err) {
                    switch (err) {
                        case 'serverError':
                            return res.status(500).end();
                        default:
                            return res.status(400).json({errors: [err]});
                    }
                }

                // Request successfully accepted. They are friends now!
                res.status(200).end();
            }
        );
    }, null, 'checkParams');
});


/**
 * @api {post} /friends/cancel/:username Cancel a friend request
 * @apiVersion 0.1.0
 * @apiName cancelFriendRequest
 * @apiGroup friends
 * @apiPermission private
 *
 * @apiDescription Cancel a friend request. either requester or requestee
 * can use this API to cancel or reject a request.
 *
 * @apiParam {String{5..15}} username
 *
 * @apiSuccessExample
 *     Request-Example:
 *         POST http://mapcode.ir/api/friends/cancel/alireza
 *     Response:
 *         HTTP/1.1 200 OK
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 *
 * @apiError (400) no_pending_request There is no request between these users.
 * @apiError (400) username_not_found There is no user with given username.
 */
router.post('/friends/cancel/:username', function (req, res) {
    req.validateWithSchema(usersModel.schema, ['username'], function () {
        friendsModel.cancelRequest(
            req.user.id,
            req.params.username,
            function (err) {
                if (err) {
                    switch (err) {
                        case 'serverError':
                            return res.status(500).end();
                        default:
                            return res.status(400).json({errors: [err]});
                    }
                }

                // Request successfully accepted. They are friends now!
                res.status(200).end();
            }
        );
    }, null, 'checkParams');
});


/**
 * @api {get} /friends/requests/ Get list of friend requests associated with user
 * @apiVersion 0.1.0
 * @apiName getFriendRequestsList
 * @apiGroup friends
 * @apiPermission private
 *
 * @apiDescription Get list of requests that has been sent from you or to you.
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/api/friends/requests
 *     Response:
 *         HTTP/1.1 200 OK
 *
 *         {
 *             "fromMe": ["mohammad", "reza"],
 *             "toMe": ["ali", "naghi"]
 *         }
 *
 * @apiSuccess {String[]} fromMe List of usernames that user has sent a friend request to.
 * @apiSuccess {String[]} toMe List of usernames that has sent friend request to user.
 */
router.get('/friends/requests', function (req, res) {
    friendsModel.getFriendRequests(
        req.user.id,
        function (err, friendRequests) {
            if (err)
                return res.status(500).end();

            return res.json(friendRequests);
        }
    );
});


/**
 * @api {get} /friends/ Get list of friends.
 * @apiVersion 0.1.0
 * @apiName getFriendsList
 * @apiGroup friends
 * @apiPermission private
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/api/friends
 *     Response:
 *         HTTP/1.1 200 OK
 *
 *         [
 *             "ali",
 *             "abbas"
 *         ]
 */
router.get('/friends/', function (req, res) {
    friendsModel.getFriends(
        req.user.id,
        function (err, friends) {
            if (err)
                return res.status(500).end();

            return res.json(friends);
        }
    );
});


/**
 * @api {delete} /friends/:username Delete friend
 * @apiVersion 0.1.0
 * @apiName deleteFriend
 * @apiGroup friends
 * @apiPermission private
 *
 * @apiDescription Delete friendship between user and a friend. All their messages will get deleted.
 * They will get removed from their mutual groups.<br />If username does not exist or is not user's friend
 * nothing will happen and 200 status ok will get returned
 *
 * @apiParam {String{5..15}} username
 *
 * @apiSuccessExample
 *     Request-Example:
 *         DELETE http://mapcode.ir/api/friends/alireza
 *     Response:
 *         HTTP/1.1 200 OK
 *
 * @apiError (400) username:empty
 * @apiError (400) username:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) username:length_not_5_to_15
 */
router.delete('/friends/:username',
    validateWithSchema(usersModel.schema, ['username'], null, 'checkParams'),
    function (req, res) {
        friendsModel.unfriend(
            req.user.id,
            req.params.username,
            function (err) {
                if (err) return res.status(500).end();

                // User successfully unfriended his friend!
                res.status(200).end();
            }
        );
    }
);


module.exports = router;
