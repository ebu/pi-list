import decode from 'jwt-decode';
import _ from 'lodash';

const tokenKey = 'ebu:bearer-token';
const difftokenKey = 'ebu:bearer-token-diff';

// //////////////////////////////////////////////////////////////////////////////
//                      MANAGE TOKEN                                           //
// //////////////////////////////////////////////////////////////////////////////

const getToken = () => {
    return localStorage.getItem(tokenKey);
};

const getDiff = () => {
    const v = localStorage.getItem(difftokenKey);
    if (typeof v === 'string') {
        return parseInt(v, 10);
    }
    if (typeof v === 'number') {
        return v;
    }

    return null;
};

const getTokenExpirationTime = token => {
    try {
        const decoded = decode(token);
        return decoded.exp;
    } catch (err) {
        return null;
    }
};

const getTokenIatTime = token => {
    try {
        const decoded = decode(token);
        return decoded.iat;
    } catch (err) {
        return null;
    }
};

const isTokenExpired = token => {
    try {
        const tokenExpiration = getTokenExpirationTime(token);
        if (_.isNil(tokenExpiration) || typeof tokenExpiration !== 'number') return true;

        const tokenDiff = getDiff();
        if (_.isNil(tokenDiff) || typeof tokenDiff !== 'number') return true;

        const estimatedTime = Date.now() - tokenDiff;

        return tokenExpiration * 1000 < estimatedTime;
    } catch (err) {
        return false;
    }
};

// //////////////////////////////////////////////////////////////////////////////
function setToken(token) {
    localStorage.setItem(tokenKey, token);
    const t = getTokenIatTime(token);
    if (_.isNil(t) || typeof t !== 'number') return;

    const diff = t * 1000 - Date.now();
    localStorage.setItem(difftokenKey, diff);
}

function removeToken() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(difftokenKey);
}

// //////////////////////////////////////////////////////////////////////////////

// Checks if token is valid
const isAuthenticated = () => {
    const token = getToken();
    const result = token && !isTokenExpired(token);
    return result;
};

export { getToken, getDiff, setToken, removeToken, isAuthenticated, getTokenExpirationTime, getTokenIatTime };
