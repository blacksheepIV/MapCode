var url = require('url');


module.exports = function (req, res, next) {
    ['Origin', 'Referer']
        .forEach(function (header) {
            if (typeof req.get(header) != 'undefined') {
                if (new url.URL(req.get(header)).hostname != process.env.HOSTNAME) {
                    res.status(403).end();
                    return;
                }
            }
        });

    next();
};
