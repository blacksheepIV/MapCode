// SMS verification code request verification schema
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


module.exports.phoneNumberKey = function (phone_number) {
    return process.env.REDIS_PREFIX + 'mphone:' + phone_number;
};
