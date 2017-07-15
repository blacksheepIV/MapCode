var router = require('express').Router();

var usersModel = require('../../models/users');
var jwt = require('../../utils/jwt');
var validateWithSchema = require('../../utils').validateWithSchema;


router.route('/signin')
    /**
     * @api {post} /signin/ Get a token by providing a valid username and password
     * @apiVersion 0.1.0
     * @apiName signIn
     * @apiGroup SignIn
     * @apiPermission public
     *
     * @apiDescription Every user can have at most two valid tokens at a time.
     * one for mobile app and one for web app. <br />
     * Assume that user already has a web token (or mobile token), if he/she attempts
     * to sign in again, a new token gets generated and the former token is no longer valid.
     * <b> Use /signin/?m for mobile signin and /signin/ for web signin</b>
     *
     * @apiParam {String{5..15}} username Person or company's username
     * @apiParam {String{6..20}} password Person or company's account password
     *
     * @apiExample {json} Request-Example
     *     {
     *         "username": "mahdavipanah",
     *         "password": "mysecretpass!"
     *     }
     *
     * @apiSuccessExample Success-Response
     *     HTTP/1.1 200 OK
     *     {
     *         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyQ29kZSI6IjRvcGVuUmU3QXoiLCJqdGkiOiJpa3QzRyJ9.OYQtuBI8kcjWcZ3VHICnwJu8IbUz_-Db5CQRdZgRxSQ"
     *     }
     *
     * @apiError (400) {username} empty
     * @apiError (400) {username} not_valid_username Can only start with english letters and then have letters, underscores, or numbers
     * @apiError (400) {username} length_not_5_to_15
     *
     * @apiError (400) {password} empty
     * @apiError (400) {password} length_not_6_to_20
     *
     * @apiError (404) username_or_password_is_wrong
     */
    .post(
        validateWithSchema(usersModel.schema, ['username', 'password']),

        function (req, res) {
            usersModel.signIn(req.body.username, req.body.password, function (err, userId) {
                if (err !== null) {
                    if (err === 'serverError') {
                        res.status(500).end();
                    }
                    else if (err === 'username_or_password_is_wrong') {
                        res.status(404).json({
                            errors: [err]
                        });
                    }
                }
                else {
                    jwt.generateToken(
                        userId,
                        req.query.m !== undefined,
                        function (err, token) {
                            if (err) {
                                res.status(500).end();
                            }
                            else {
                                res.json({
                                    token: token
                                });
                            }
                        }
                    );
                }
            });
        }
    );


module.exports = router;
