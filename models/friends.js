var lodashIncludes = require('lodash/includes');

var db = require('../db');


/*
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
                // Application error has happened
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
