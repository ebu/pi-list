const base64 = require('base64-min');

module.exports = (password) => {
    const tokenAndEncryptedPassword = base64.decode(password).split('.');
    const token = tokenAndEncryptedPassword[0];
    const filteredToken = token.replace(/[a-z]/g, '');
    const encryptedPassword = tokenAndEncryptedPassword[1];
    const passwordData = base64.decodeWithKey(encryptedPassword, filteredToken).split('.');
    const plainTextPassword = passwordData[0];

    return {
        rawPassword: plainTextPassword,
        token
    };
};
