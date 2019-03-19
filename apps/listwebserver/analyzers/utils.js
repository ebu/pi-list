const _ = require('lodash');

function appendError(stream, value) {
    const errors = _.get(stream, 'error_list', []);
    errors.push(value);
    _.set(stream, 'error_list', errors);
    return stream;
}

module.exports = {
    appendError
};
