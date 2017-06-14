/**
 * Groups.
 *
 * @module models/groups
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */

var lodashIncludes = require('lodash/includes');
var asyncForEach = require('async/each');
var moment = require('moment');

var db = require('../db');


/**
 * Groups's fields that are available.
 *
 * @constant
 * @type {string[]}
 */
module.exports.publicFields = ['name', 'members'];


/**
 * Group verification schema.
 *
 * @constant
 * @type {object}
 */
module.exports.schema = {
    'name': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 25},
            errorMessage: 'length_not_1_to_25'
        }
    },
    'members': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isArray: {
            errorMessage: 'not_array'
        }
    }
};


/**
 * Group update verification schema.
 *
 * @constant
 * @type {object}
 */
module.exports.updateSchema = {
    'new_name': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isLength: {
            options: {min: 1, max: 25},
            errorMessage: 'length_not_1_to_25'
        }
    },
    'new_members': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isArray: {
            errorMessage: 'not_array'
        }
    }
};


/**
 * Adds a new group for a user.
 *
 * @param {(number|string)} userId User's ID.
 * @param {string} gpName Group's name.
 * @param {string[]} gpMembers List of group's members usernames.
 * @param {function} [callback]
 *
 * @throws {'group_already_exists'}
 * @throws {'username_%s_not_friend'} '%s' will replace with username. Happens username is group's owner, username does not exist or username is not a friend of group's owner.
 *
 * @throws {'serverError'}
 */
module.exports.add = function (userId, gpName, gpMembers, callback) {
    // Call addGroup DB procedure
    db.conn.query(
        "CALL `addGroup` (?, ?, ?)",
        [userId, gpName, gpMembers],
        function (err) {
            // DB error has happened
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, 'GROUP_ALREADY_EXISTS'))
                        return callback('group_already_exists');

                    var notFriendUsernameError = /USERNAME_(.*)_NOT_FRIEND/.exec(err.message);
                    if (notFriendUsernameError)
                        return callback(notFriendUsernameError[0].toLowerCase());
                }

                console.error("add@models/groups: Error in calling addGroup DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Group successfully added!
            callback();
        }
    );
};


/**
 * Deletes a group for a user.
 *
 * Nothing will happen if group or user does not exists
 * and no error will throw.
 *
 * @param {(number|string)} userId User's ID.
 * @param {string} gpName Group's name.
 * @param {function} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.delete = function (userId, gpName, callback) {
    db.conn.query(
        "DELETE FROM `groups` WHERE `owner` = ? AND `name` = ?",
        [userId, gpName],
        function (err) {
            // MySQL error happened
            if (err) {
                console.error("MySQL: Error in deleting user's group:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }


            // Group has deleted
            callback();
        }
    );
};


/**
 * Updates a user's group.
 *
 * @param {(number|string)} userId User's ID.
 * @param {string} gpName Group's name.
 * @param {string} newName Group's new name. Give null if name update is not intended.
 * @param {string[]} members List of group's new members usernames. Give null if members update is not intended.
 * @param {function} [callback]
 *
 * @throws {'group_not_exists'}
 * @throws {'group_already_exists'}
 * @throws {'username_%s_not_friend'} '%s' will replace with username. Happens username is group's owner, username does not exist or username is not a friend of group's owner.
 *
 * @throws {'serverError'}
 */
module.exports.update = function (userId, gpName, newName, members, callback) {
    if (Array.isArray(members))
        members = members.join(' ');  // DB procedure wants members to be list of members split with space, e.g. "ali hamid".

    db.conn.query(
        "CALL `updateGroup` (?, ?, ?, ?)",
        [userId, gpName, newName, members],
        function (err) {
            // DB error has happened
            if (err) {
                // Procedure error has happened
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, 'GROUP_ALREADY_EXISTS'))
                        return callback('group_already_exists');

                    if (lodashIncludes(err.message, 'GROUP_NOT_EXISTS'))
                        return callback('group_not_exists');

                    var notFriendUsernameError = /USERNAME_(.*)_NOT_FRIEND/.exec(err.message);
                    if (notFriendUsernameError)
                        return callback(notFriendUsernameError[0].toLowerCase());
                }

                console.error("add@models/groups: Error in calling addGroup DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Group successfully added!
            callback();
        }
    );
};


/**
 * @callback groupsGetCallback
 * @param err
 * @param {object} groupInfo
 */

/**
 * Gets a group's info.
 *
 * @param {(number|string)} userId Group's owner ID.
 * @param {string} groupName Group's name.
 * @param {string[]} fields List of fields to retrieve.
 * @param {groupsGetCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.get = function (userId, groupName, fields, callback) {
    db.conn.query(
        "SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `groups_detailed`" +
        " WHERE `owner` = ? AND `name` = ?",
        [userId, groupName],
        function (err, results) {
            if (err) {
                console.error("getGroup@models/groups.js: MySQL: Error in getting group's info:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            if (results[0] && results[0].members)
                results[0].members = results[0].members.split(' ');

            callback(null, results[0]);
        }
    );
};


/**
 * @callback groupsGetUserGroupsCallback
 * @param err
 * @param {object[]} groupsInfo
 */

/**
 * Gets the list of user's groups.
 *
 * @param {(number|string)} userId User's ID.
 * @param {string[]} fields List of fields to retrieve.
 * @param {(number|string)} start
 * @param {(number|string)} limit
 * @param {groupsGetUserGroupsCallback} [callback]
 *
 * @throws {'serverError'}
 */
module.exports.getUserGroups = function (userId, fields, start, limit, callback) {
    db.conn.query(
        " SELECT " + (fields === '*' ? '*' : fields.map(db.conn.escapeId)) +
        " FROM `groups_detailed`" +
        " WHERE `owner` = ?" +
        " LIMIT ?, ?",
        [userId, start, limit],
        function (err, results) {
            if (err) {
                console.error("getUserGroups@models/groups.js: Error in getting user's groups:\n\n\t%s\n\tQuery:\n\n\t%s", err, err.sql);
                return callback('serverError');
            }

            // If `members` field is requested, split the field by ' ' and make it a array
            if (fields.includes('members')) {
                asyncForEach(
                    results,
                    function (result, done) {
                        result.members = result.members.split(' ');
                        done();
                    },
                    function (err) {
                        if (err) {
                            console.error("getUserGroups@models/groups.js: Error in splitting results members field:\n\n\t%s" + err);
                            return callback('serverError');
                        }

                        callback(null, results);
                    }
                );
            }
            else
                callback(null, results);
        }
    );
};


/**
 * Sends a message to group members.
 *
 * @param {(number|string)} sender Group's owner's ID.
 * @param {string} gpName Group's name.
 * @param {string} point General point's code.
 * @param {string} personal_point Personal point's code.
 * @param {string} message
 * @param {function} [callback]
 *
 * @throws {'sender_not_found'}
 * @throws {'receiver_not_found'}
 * @throws {'point_not_found'}
 * @throws {'personal_point_not_found'}
 * @throws {'not_point'}
 * @throws {'both_points'}
 * @throws {'self_message'}
 *
 * @throws {'serverError'}
 */
module.exports.sendMessage = function (sender, gpName, point, personal_point, message, callback) {
    var sent_time = moment().format('YYYY-MM-DD HH:mm:ss');
    db.conn.query(
        "CALL `sendGroupMessage` (?, ?, ?, ?, ?, ?)",
        [sender, gpName, point, personal_point, sent_time, message],
        // MySQL error has happened
        function (err) {
            if (err) {
                if (err.sqlState === '45000') {
                    if (lodashIncludes(err.message, "PERSONAL_POINT_NOT_FOUND"))
                        return callback('personal_point_not_found');

                    if (lodashIncludes(err.message, "SENDER_NOT_FOUND"))
                        return callback('sender_not_found');

                    if (lodashIncludes(err.message, "GROUP_NOT_FOUND"))
                        return callback('group_not_found');

                    if (lodashIncludes(err.message, "POINT_NOT_FOUND"))
                        return callback('point_not_found');

                    if (lodashIncludes(err.message, "NO_POINT"))
                        return callback('no_point');

                    if (lodashIncludes(err.message, "BOTH_POINTS"))
                        return callback('both_points');
                }

                // Unexpected MySQL error has happened
                console.error("sendMessage@models/groups: Error in calling sendGroupMessage DB procedure:\n\t\t%s\n\tQuery:\n\t\t%s", err, err.sql);
                return callback('serverError');
            }

            // Message successfully sent to all group members
            callback();
        }
    );
};
