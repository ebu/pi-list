const deepFreeze = require('deep-freeze');

const HTTP_STATUS_CODE = {
    SUCCESS: {
        OK: 200,
        CREATED: 201
    },
    CLIENT_ERROR: {
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        NOT_FOUND: 404
    },
    SERVER_ERROR: {
        INTERNAL_SERVER_ERROR: 500
    }
};

module.exports = deepFreeze(HTTP_STATUS_CODE);
