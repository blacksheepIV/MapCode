var router = require('express').Router();

var messagesModel = require('../../models/messages');


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
 * @apiError (400) description:length_greater_than_21844
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
    function (req, res, next) {
        req.validateWithSchema(messagesModel.schema, 'all', function () {
            // Check if no point or personal point is given
            if (!req.body.point && !req.body.personal_point)
                return res.status(400).json({errors: ['no_point']});

            // Check if both point and personal point is given
            if (req.body.point && req.body.personal_point)
                return res.status(400).json({errors: ['both_points']});

            // Inputs are fine, continue.
            next();
        }, ['point', 'personal_point', 'message']);
    },
    function (req, res) {
        messagesModel.send(
            req.user.id,
            req.body.receiver,
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

                // Hooray! message successfully sent.
                res.status(200).end();
            }
        );
    });


module.exports = router;
