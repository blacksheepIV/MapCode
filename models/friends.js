var lodashIncludes = require('lodash/includes');

var db = require('../db');


/*
    Submits a friend request from user(id) to user(username)

    Errors:
        - are_already_friends
        - already_request_pending
        - self_request
        - username_not_found

        - serverError
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

                console.error("sendRequest@models/friends: Error in calling friendRequest DB procedure: query: %, error: %s", err.sql, err);
                return callback('serverError');
            }

            callback();
        }
    );
};


/*
    Accepts the request sent from user(username) to user(id)

    Errors:
        - your_not_requestee
        - no_pending_request
        - username_not_found
        - requestee_max_friends
        - requester_max_friends

        - serverError
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

                console.error("acceptRequest@models/friends: Error in calling acceptFriendRequest DB procedure: query: %, error: %s", err.sql, err);
                return callback('serverError');
            }

            callback();
        }
    );
};


/*
 Cancel the request sent from user(id) to user(username)

 Errors:
 - no_pending_requests
 - username_not_found

 - serverError
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

                console.error("cancelRequest@models/friends: Error in calling cancelFriendRequest DB procedure: query: %, error: %s", err.sql, err);
                return callback('serverError');
            }

            callback();
        }
    );
};


/*
    Get the list of friend requests for a user

    Errors:
        - serverError
 */
module.exports.getFriendRequests = function (id, callback) {
    db.conn.query(
        "SELECT `users`.`username` " +
        "FROM `friend_requests` " +
        "JOIN `users` ON " +
            "IF(first_user != requester, first_user, second_user) = `users`.`id` " +
        "WHERE `requester` = ?;" +
        "SELECT `users`.`username` " +
        "FROM `friend_requests` " +
        "JOIN `users` ON " +
            "IF(first_user = requester, first_user, second_user) = `users`.`id` " +
        "WHERE `requester` != ? AND (first_user = ? OR second_user = ?);",
        [id, id, id, id],
        function (err, results) {
            if (err) {
                console.log("MySQL: Error in getting user's friend requests. query: %s\nError: %s", err.sql, err);
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


/*
 Get the list of friends

 Errors:
 - serverError
 */
module.exports.getFriends = function (id, callback) {
    db.conn.query(
        "SELECT `users`.`username` " +
        "FROM `friends` " +
        "JOIN `users` ON IF(first_user = ?, second_user, first_user) = `users`.`id` " +
        "WHERE (first_user = ? OR second_user = ?)",
        [id, id, id],
        function (err, results) {
            if (err) {
                console.log("MySQL: Error in getting user's friends. query: %s\nError: %s", err.sql, err);
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
