var router = require('express').Router();

var friendsModel = require('../../models/friends');


// TODO: Cancel friend request
// TODO: Get friend requests
    // TODO: Get friend requests count
// TODO: Get friends
    // TODO: Get friends count


router.post('/friends/:username', function (req, res) {
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
});


router.post('/friends/accept/:username', function (req, res) {
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
});


module.exports = router;
