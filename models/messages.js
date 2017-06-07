/**
 * Messages.
 *
 * @module models/messages
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */

var lodashIncludes = require('lodash/includes');
var moment = require('moment');

var db = require('../db');


/**
 * message's fields that are available.
 *
 * @constant
 * @type {string[]}
 */
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


/**
 * Message verification schema.
 *
 * @constant
 * @type {object}
 */
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


/**
 * @callback messagesSendCallback
 * @param err
 * @param {number} messageCode Sent message's unique code.
 */

/**
 * Sends a message.
 *
 * @param {(number|string)} sender Sender user's ID.
 * @param {string} receiverUsername Receiver user's username.
 * @param {string} point General point's code.
 * @param {(number|string)} personal_point Personal point's code.
 * @param {string} message
 * @param {messagesSendCallback} [callback]
 *
 * @throws {'sender_not_found'}
 * @throws {'receiver_not_found'}
 * @throws {'point_not_found'}
 * @throws {'personal_point_not_found'}
 * @throws {'no_point'}
 * @throws {'both_points'}
 * @throws {'self_message'}
 *
 * @throws {'serverError'}
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
                console.error("send@models/messages: Error in calling sendMessage DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Hooray! Message successfully sent!
            callback(null, results[1][0].message_id);
        }
    );
};


/**
 * Deletes a message with given code and it's sender or receiver.
 *
 * @param {(number|string)} senderOrReceiver The ID of sender or receiver.
 * @param {(number|string)} msgCode Message's code
 * @param {function} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.delete = function (senderOrReceiver, msgCode, callback) {
    db.conn.query(
        "DELETE FROM `messages` WHERE (`sender` = ? OR `receiver` = ?) AND `id` = ?",
        [senderOrReceiver, senderOrReceiver, msgCode],
        // MySQL error
        function (err) {
            if (err) {
                console.error("delete@models/messages: MySQL error in deleting message:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            return callback();
        }
    );
};


/**
 * @callback messagesGetUserMessagesCallback
 * @param err
 * @param {object[]} userMessages
 */

/**
 * Gets the list of user's messages.
 *
 * @param {string} receiverOrSender If is 'sender' gets user's sent messages and if is 'receiver' get's user's received messages.
 * @param {string} username User's username.
 * @param {string[]} fields List of fields to retrieve.
 * @param {(number|string)} start
 * @param {(number|string)} limit
 * @param {messagesGetUserMessagesCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getUserMessages = function (receiverOrSender, username, fields, start, limit, callback) {
    db.conn.query(
        " SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `messages_detailed`" +
        " WHERE ?? = ?" +
        " LIMIT ?, ?",
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


/**
 * @callback messagesGetCallback
 * @param err
 * @param {object} message
 */

/**
 * Gets message's content.
 *
 * @param {string} username Sender or receiver user's username.
 * @param {(number|string)} msgCode Message's code.
 * @param {string[]} fields List of fields to retrieve.
 * @param {messagesGetCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.get = function (username, msgCode, fields, callback) {
    db.conn.query(
        " SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `messages_detailed` "+
        " WHERE (`sender` = ? OR `receiver` = ?)" +
        "       AND `code` = ?",
        [username, username, msgCode],
        function (err, results) {
            // MySQL error
            if (err) {
                console.error("get@models/messages: MySQL error in getting message's content:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            callback(null, results[0]);
        }
    );
};
