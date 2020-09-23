import decode from 'jwt-decode';
import { evaluate } from 'mathjs';

const tokenKey = 'ebu:bearer-token';
const difftokenKey = 'ebu:bearer-token-diff';

// //////////////////////////////////////////////////////////////////////////////
//                      MANAGE TOKEN                                           //
// //////////////////////////////////////////////////////////////////////////////

const getToken = () => {
    return localStorage.getItem(tokenKey);
};

const getDiff = () => {
    return localStorage.getItem(difftokenKey);
};

const getTokenExpirationTime = token => {
    try {
        const decoded = decode(token);
        return decoded.exp;
    } catch (err) {
        return false;
    }
};

const getTokenIatTime = token => {
    try {
        const decoded = decode(token);
        return decoded.iat;
    } catch (err) {
        return false;
    }
};

const isTokenExpired = token => {
    try {
        const tokenExpiration = getTokenExpirationTime(token);

        const tokenDiff = getDiff();
        const estimatedTime = evaluate(`${Date.now()} - ${tokenDiff}`);

        return tokenExpiration * 1000 < estimatedTime;
    } catch (err) {
        return false;
    }
};

// //////////////////////////////////////////////////////////////////////////////
function setToken(token) {
    localStorage.setItem(tokenKey, token);
    const diff = getTokenIatTime(token) * 1000 - Date.now();
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
