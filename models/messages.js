var lodashIncludes = require('lodash/includes');
var moment = require('moment');

var db = require('../db');


module.exports.publicFields = [
    'code',
    'sender',
    'receiver',
    'lat',
    'lng',
    'non_personal',
    'point_code',
    'message',
    'sent_time'
];


// Verification schema
module.exports.schema = {
    'receiver': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isUsername: {
            errorMessage: 'not_valid_username'
        },
        isLength: {
            options: {min: 5, max: 15},
            errorMessage: 'length_not_5_to_15'
        }
    },
    'point': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isPointCode: {
            errorMessage: 'not_valid_point_code'
        }
    },
    'personal_point': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isInt: {
            errorMessage: 'not_numeric'
        }
    },
    'message': {
        isLength: {
            options: {max: 21844},
            errorMessage: 'length_greater_than_21844'
        }
    }
};


/*
    Sends a message

    Errors:
        - sender_not_found
        - receiver_not_found
        - point_not_found
        - personal_point_not_found
        - no_point
        - both_points
        - self_message

        - serverError
 */
module.exports.send = function (sender,
                                receiverUsername,
                                point,
                                personal_point,
                                message,
                                callback) {
    var sent_time = moment().format('YYYY-MM-DD HH:mm:ss');
    db.conn.query(
        "CALL `sendMessage`(?, ?, ?, ?, ?, ?, @message_id); SELECT @message_id as `message_id`;",
        [sender, receiverUsername, point, personal_point, sent_time, message],
        function (err, results) {
            // MySQL error has happened
            if (err) {
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, "PERSONAL_POINT_NOT_FOUND"))
                        return callback('personal_point_not_found');

                    if (lodashIncludes(err.message, "SENDER_NOT_FOUND"))
                        return callback('sender_not_found');

                    if (lodashIncludes(err.message, "RECEIVER_NOT_FOUND"))
                        return callback('receiver_not_found');

                    if (lodashIncludes(err.message, "POINT_NOT_FOUND"))
                        return callback('point_not_found');

                    if (lodashIncludes(err.message, "NO_POINT"))
                        return callback('no_point');

                    if (lodashIncludes(err.message, "BOTH_POINTS"))
                        return callback('both_points');

                    if (lodashIncludes(err.message, "SELF_MESSAGE"))
                        return callback('self_message');
                }

                // Unexpected MySQL error has happened
                console.error("send@models/messages: Error in calling sendMessage DB procedure: %s\nQuery:\n\t%s", err, err.sql);
                return callback('serverError');
            }

            // Hooray! Message successfully sent!
            callback(null, results[1][0].message_id);
        }
    );
};


/*
    Deletes a message with given id and sender

    Errors:
        - serverError
 */
module.exports.delete = function (sender, msgId, callback) {
    db.conn.query(
        "DELETE FROM `messages` WHERE `sender` = ? AND `id` = ?",
        [sender, msgId],
        function (err) {
            if (err) {
                console.error("delete@models/messages: MySQL error in deleting message: %s\nQuery:\n\t%s", err, err.sql);
                return callback('serverError');
            }

            return callback();
        }
    );
};


/*
    Get list of user's messages
 */
module.exports.getUserMessages = function (receiverOrSender, username, fields, start, limit, callback) {
    db.conn.query(
        "SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `messages_detailed` " +
        "WHERE ?? = ? " +
        "LIMIT ?, ?",
        [receiverOrSender, username, start, limit],
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("getUserInbox@models/messages: MySQL error in getting user's inbox messages:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            callback(null, results);
        }
    );
};
