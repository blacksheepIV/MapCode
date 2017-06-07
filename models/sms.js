/**
 * SMS.
 *
 * @module models/sms
 * @author Hamidreza Mahdavipanah <h.mahdavipanah@gmail.com>
 */


/**
 * SMS verification schema.
 *
 * @constant
 * @type {object}
 */
module.exports.schema = {
    'mobile_phone': {
        notEmpty: {
            errorMessage: 'empty'
        },
        isInt: {
            errorMessage: 'not_numeric'
        },
        isLength: {
            options: {max: 11, min: 11},
            errorMessage: 'length_not_11'
        }
    }
};


/**
 * Returns associated Redis key for a phone number's verification code
 */
module.exports.phoneNumberKey = function (phone_number) {
    return process.env.REDIS_PREFIX + 'mphone:' + phone_number;
};
