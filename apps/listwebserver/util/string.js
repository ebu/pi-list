const { isString } = require('lodash');

function removeLastLineBreak(string) {
    return isString(string) ? string.replace(/\n$/, '') : '';
}

module.exports = {
    removeLastLineBreak
};
