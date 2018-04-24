const logger = require('../util/logger');

let sessionTokens = [];

module.exports = {
    storeToken: (tokenID) =>  {
        sessionTokens.push(tokenID);
        logger('token-manager').info(`New token stored ${tokenID} | Available tokens: ${sessionTokens.toString()}`);
    },

    isValidToken: (tokenID) => {
        return sessionTokens.includes(tokenID);
    },

    setTokenAsInvalid: (tokenID) => {
        sessionTokens = sessionTokens.filter(token => token !== tokenID);
        logger('token-manager').info(`Removed token ${tokenID} | Available tokens: ${sessionTokens.toString()}`);
    }
};
