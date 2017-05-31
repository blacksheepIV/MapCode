var router = require('express').Router();

var messagesModel = require('../../models/messages');
var validateWithSchema = require('../../utils').validateWithSchema;
var customFielder = require('../../utils').customFielder;
var startLimitChecker = require('../../utils').startLimitChecker;


/**
 * @api {post} /messages/ Send message
 * @apiVersion 0.1.0
 * @apiName sendMessage
 * @apiGroup messages
 * @apiPermission private
 *
 * @apiDescription Send a public, or private or personal
 * which is owned by user, with a message to another user.<br />
 * One of 'point' or 'personal_point' fields must be empty. It means
 * the user can only send a personal OR non-personal point.
 *
 * @apiParam {String{5..15}} receiver
 * @apiParam {String{17}} [point] A non-personal point code
 * @apiParam {Number} [personal_point] A personal point code
 * @apiParam {String{1..21844}} [message] Message's content
 *
 * @apiExample {json} Request-Example
 *     {
 *         "receiver": "mohammad",
 *         "point": "mp001002000000123",
 *         "message": "This is a good point!"
 *     }
 *
 * @apiSuccessExample Success-Response
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "code": "113423"
 *     }
 *
 * @apiError (400) receiver:empty
 * @apiError (400) receiver:not_valid_username Can only start with english letters and then have letters, underscores, or numbers
 * @apiError (400) receiver:length_not_5_to_15
 *
 * @apiError (400) point:empty A point should not be defined or it can't be empty
 * @apiError (400) point:not_valid_point_code A valid point code starts with 'mp' and continues with 15 digits.
 *
 * @apiError (400) personal_point:empty A personal point should not be defined or it can't be empty
 * @apiError (400) personal_point:numeric
 *
 * @apiError (400) personal_point_not_found Either there is no personal point with is id or it's now owned by user
 * @apiError (400) sender_not_found !!! If you got this log out the user
 * @apiError (400) receiver_not_found There is no user with given username
 * @apiError (400) point_not_found Either there is no point with given code or it's private and not owned by user
 *
 * @apiError (400) no_point None of 'point' and 'personal_point' have given
 * @apiError (400) both_points Both 'point' and 'personal_point' have given
 * @apiError (400) self_message User can't send a message to him/her self!
 */
router.post('/messages',
    // Validate inputs for sending message
    validateWithSchema(messagesModel.schema, 'all', ['point', 'personal_point', 'message']),
    function (req, res, next) {
        // Check if no point or personal point is given
        if (!req.body.point && !req.body.personal_point)
            return res.status(400).json({errors: ['no_point']});

        // Check if both point and personal point is given
        if (req.body.point && req.body.personal_point)
            return res.status(400).json({errors: ['both_points']});

        // Inputs are fine, continue.
        next();
    },

    function (req, res) {
        messagesModel.send(
            req.user.id,
            req.body.receiver,
            req.body.point,
            req.body.personal_point,
            req.body.message,
            function (err, message_code) {
                if (err) {
                    switch (err) {
                        case 'serverError':
                            return res.status(500).end();
                        default:
                            return res.status(400).json({errors: [err]});
                    }
                }

                // Hooray! message successfully sent.
                res.status(200).json({code: message_code});
            }
        );
    });


/**
 * @api {delete} /messages/:code Delete a message with given code.
 * @apiVersion 0.1.0
 * @apiName deleteMessage
 * @apiGroup messages
 * @apiPermission private
 *
 * @apiDescription Deletes a message (with given code) for user with given token.
 * If user is not sender or receiver, nothing will happen and 200 status code will get returned.
 *
 * @apiParam {Number} code Message's code
 *
 * @apiSuccessExample
 *     Request-Example:
 *         DELETE http://mapcode.ir/api/messages/10
 *     Response:
 *         HTTP/1.1 200 OK
 *
 *
 * @apiError (400) code:not_numeric
 */
router.delete('/messages/:code',
    validateWithSchema({'code': {isInt: {errorMessage: 'not_numeric'}}}, 'all', null, 'checkParams'),
    function (req, res) {
        messagesModel.delete(
            req.user.id,
            req.params.code,
            function (err) {
                // serverError
                if (err)
                    return res.status(500).end();

                res.status(200).end();
            }
        );
    }
);



/**
 * @api {get} /messages/ Get user's message inbox (messages to user)
 * @apiVersion 0.1.0
 * @apiName getUserMessages
 * @apiGroup messages
 * @apiPermission private
 *
 * @apiParam {Number{1..}} [start=1] Send messages from start-th point!
 * @apiParam {Number{1..100}} [limit=100] Number of messages to receive.
 *
 * @apiParam {String[]} [fields] Can be composition of these (separated with comma(',')): code, sender, receiver, lat, lng, non_personal, point_code, message, sent_time
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/messages
 *     Response:
 *        HTTP/1.1 200 OK
 *
 *        [
 *           {
 *             "id": "1010",
 *             "sender": "mohammad",
 *             "receiver": "alireza",
 *             "lat": "21.32",
 *             "lng": "25.43",
 *             "non_personal": "1",
 *             "point_code": "mp005001000000001",
 *             "sent_time": "2017-05-13 19:45:15"
 *          },
 *          {
 *             "id": "10",
 *             "sender": "mohammad",
 *             "receiver": "alireza",
 *             "lat": "61.32",
 *             "lng": "110.43",
 *             "non_personal": "0",
 *             "point_code": "mp005001000000002",
 *             "sent_time": "2016-05-13 19:45:15"
 *          }
 *        ]
 */
router.get('/messages',
    startLimitChecker,
    customFielder('query', 'fields', messagesModel.publicFields),
    function (req, res) {
        messagesModel.getUserMessages(
            'receiver',
            req.user.username,
            req.queryFields,
            req.queryStart,
            req.queryLimit,
            function (err, messages) {
                // serverError
                if (err)
                    return res.status(500).end();

                return res.json(messages);
            }
        );
    }
);


/**
 * @api {get} /messages/outbox Get user's sent messages
 * @apiVersion 0.1.0
 * @apiName getUserSentMessages
 * @apiGroup messages
 * @apiPermission private
 *
 * @apiParam {Number{1..}} [start=1] Send messages from start-th point!
 * @apiParam {Number{1..100}} [limit=100] Number of messages to receive.
 *
 * @apiParam {String[]} [fields] Can be composition of these (separated with comma(',')): code, sender, receiver, lat, lng, non_personal, point_code, message, sent_time
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/messages/outbox
 *     Response:
 *        HTTP/1.1 200 OK
 *
 *        [
 *           {
 *             "id": "1010",
 *             "sender": "mohammad",
 *             "receiver": "alireza",
 *             "lat": "21.32",
 *             "lng": "25.43",
 *             "non_personal": "1",
 *             "point_code": "mp005001000000001",
 *             "sent_time": "2017-05-13 19:45:15"
 *          },
 *          {
 *             "id": "10",
 *             "sender": "mohammad",
 *             "receiver": "alireza",
 *             "lat": "61.32",
 *             "lng": "110.43",
 *             "non_personal": "0",
 *             "point_code": "mp005001000000002",
 *             "sent_time": "2016-05-13 19:45:15"
 *          }
 *        ]
 */
router.get('/messages/outbox',
    startLimitChecker,
    customFielder('query', 'fields', messagesModel.publicFields),
    function (req, res) {
        messagesModel.getUserMessages(
            'sender',
            req.user.username,
            req.queryFields,
            req.queryStart,
            req.queryLimit,
            function (err, messages) {
                // serverError
                if (err)
                    return res.status(500).end();

                return res.json(messages);
            }
        );
    }
);


/**
 * @api {get} /messages/:code Get a message's content
 * @apiVersion 0.1.0
 * @apiName getMessage
 * @apiGroup messages
 * @apiPermission private
 *
 * @apiParam {Number} code Message's code
 *
 * @apiParam {String[]} [fields] Can be composition of these (separated with comma(',')): code, sender, receiver, lat, lng, non_personal, point_code, message, sent_time
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/messages/1010
 *     Response:
 *        HTTP/1.1 200 OK
 *
 *        {
 *            "id": "1010",
 *            "sender": "alireza",
 *            "receiver": "mohammad",
 *            "lat": "21.32",
 *            "lng": "25.43",
 *            "non_personal": "1",
 *            "point_code": "mp005001000000001",
 *            "sent_time": "2017-05-13 19:45:15"
 *        }
 *
 * @apiSuccessExample
 *     Request-Example:
 *         GET http://mapcode.ir/messages/1011?fields=lat,lng
 *     Response:
 *        HTTP/1.1 200 OK
 *
 *        {
 *            "lat": "21.32",
 *            "lng": "25.43",
 *        }
 */
router.get('/messages/:code',
    validateWithSchema(
        {
            'code': {
                isInt: {
                    errorMessage: 'not_numeric'
                }
            }
        },
        'all', null, 'checkParams'
    ),

    customFielder('query', 'fields', messagesModel.publicFields),

    function (req, res) {
        messagesModel.get(
            req.user.username,
            req.params.code,
            req.queryFields,
            function (err, msg) {
                if (err) return res.status(500).end();

                if (msg)
                    return res.json(msg);

                // No point found!
                res.status(404).end();
            }
        );
    }
);


module.exports = router;
