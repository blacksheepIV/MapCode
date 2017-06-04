/**
 * Friends
 *
 * @module models/friends
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */

var lodashIncludes = require('lodash/includes');

var db = require('../db');


/**
 * Submits a friend request from user(id) to user(username).
 *
 * @param {(number|string)} id Requester user's id
 * @param {string} username Username Requestee user's username
 * @param {function} [callback]
 *
 * @throws {'are_already_friends'}
 * @throws {'already_request_pending'}
 * @throws {'self_request'}
 * @throws {'username_not_found'}
 *
 * @throws {'serverError'}
 */
module.exports.sendRequest = function (id, username, callback) {
    // Call friendRequest DB procedure
    db.conn.query(
        "CALL friendRequest(?, ?);",
        [id, username],
        function (err) {
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, "ARE_ALREADY_FRIENDS"))
                        return callback('are_already_friends');

                    if (lodashIncludes(err.message, "ALREADY_REQUEST_PENDING"))
                        return callback('already_request_pending');

                    if (lodashIncludes(err.message, "SELF_REQUEST"))
                        return callback('self_request');

                    if (lodashIncludes(err.message, "USERNAME_NOT_FOUND"))
                        return callback('username_not_found');
                }

                console.error("sendRequest@models/friends: Error in calling friendRequest DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Request successfully sent
            callback();
        }
    );
};


/**
 * Unfriends two users.
 *
 * @param {(number|string)} first_user_id First user's ID
 * @param {string} second_user_username Second user's username
 * @param {function} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.unfriend = function (first_user_id, second_user_username, callback) {
    // Call acceptFriendRequest DB procedure
    db.conn.query(
        "CALL unfriend(?, ?)",
        [first_user_id, second_user_username],
        function (err) {
            // MySQL error
            if (err) {
                console.error("unfriend@models/friends: Error in calling `unfriend` DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Two users are not friends anymore!
            callback();
        }
    );
};


/**
 * Accepts the request sent from user(username) to user(id).
 *
 * @param {(number|string)} id Requestee user's ID
 * @param {string} username Requester user's username
 * @param {function} [callback]
 *
 * @throws {'your_not_requestee'}
 * @throws {'no_pending_request'}
 * @throws {'username_not_found'}
 * @throws {'requestee_max_friends'}
 * @throws {'requester_max_friends'}
 *
 * @throws {'serverError'}
 */
module.exports.acceptRequest = function (id, username, callback) {
    // Call acceptFriendRequest DB procedure
    db.conn.query(
        "CALL acceptFriendRequest(?, ?, ?);",
        [id, username, process.env.MAX_FRIENDS],
        function (err) {
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, "YOUR_NOT_REQUESTEE"))
                        return callback('your_not_requestee');

                    if (lodashIncludes(err.message, "NO_PENDING_REQUEST"))
                        return callback('no_pending_request');

                    if (lodashIncludes(err.message, "USERNAME_NOT_FOUND"))
                        return callback('username_not_found');

                    if (lodashIncludes(err.message, "REQUESTEE_MAX_FRIENDS"))
                        return callback('requestee_max_friends');

                    if (lodashIncludes(err.message, "REQUESTER_MAX_FRIENDS"))
                        return callback('requester_max_friends');
                }

                console.error("acceptRequest@models/friends: Error in calling acceptFriendRequest DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Hooray! Two users are now friends.
            callback();
        }
    );
};


/**
 * Cancels the request sent from user(id) to user(name).
 *
 * @param {(number|string)} id Requestee user's ID
 * @param {string} username Requester user's username
 * @param {function} [callback]
 *
 * @throws {'no_pending_request'}
 * @throws {'username_not_found'}
 *
 * @throws {'serverError'}
 */
module.exports.cancelRequest = function (id, username, callback) {
    // Call cancelFriendRequest DB procedure
    db.conn.query(
        "CALL cancelFriendRequest(?, ?);",
        [id, username, process.env.MAX_FRIENDS],
        function (err) {
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, "YOUR_NOT_REQUESTER"))
                        return callback('your_not_requester');

                    if (lodashIncludes(err.message, "NO_PENDING_REQUEST"))
                        return callback('no_pending_request');

                    if (lodashIncludes(err.message, "USERNAME_NOT_FOUND"))
                        return callback('username_not_found');
                }

                console.error("cancelRequest@models/friends: Error in calling cancelFriendRequest DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Request successfully canceled
            callback();
        }
    );
};


/**
 * Gets the list of friend requests for a user.
 *
 * @param {(number|string)} id User's id
 * @param {function} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getFriendRequests = function (id, callback) {
    id = db.conn.escape(id);
    db.conn.query(
        "SELECT `users`.`username` " +
        "FROM `friend_requests` " +
        "JOIN `users` ON " +
            "IF(first_user != requester, first_user, second_user) = `users`.`id` " +
        "WHERE `requester` = " + id +";" +
        "SELECT `users`.`username` " +
        "FROM `friend_requests` " +
        "JOIN `users` ON " +
            "IF(first_user = requester, first_user, second_user) = `users`.`id` " +
        "WHERE `requester` != " + id + " AND (first_user = " + id + " OR second_user = " + id + ");",
        function (err, results) {
            if (err) {
                console.error("getFriendRequests@models/friends: MySQL: Error in getting user's friend requests:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            var friendRequests = {
                // Requests that has been sent from me
                fromMe: results[0].map(function (result) {
                    return result.username;
                }),
                // Requests that has been sent to me
                toMe: results[1].map(function (result) {
                    return result.username;
                })
            };

            callback(null, friendRequests);
        }
    );
};


/**
 * Gets the list of friends.
 *
 * @param {(number|string)} id User's id
 * @param {function} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getFriends = function (id, callback) {
    id = db.conn.escape(id);
    db.conn.query(
        "SELECT `users`.`username` " +
        "FROM `friends` " +
        "JOIN `users` ON IF(first_user = " + id + ", second_user, first_user) = `users`.`id` " +
        "WHERE (first_user = " + id + " OR second_user = " + id + ")",
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("getFriends@models/friends: MySQL: Error in getting user's friends:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            callback(null,
                results.map(function (result) {
                    return result.username;
                })
            );
        }
    );
};
