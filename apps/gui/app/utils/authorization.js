import decode from 'jwt-decode';

const tokenKey = 'ebu:bearer-token';

// //////////////////////////////////////////////////////////////////////////////
//                      MANAGE TOKEN                                           //
// //////////////////////////////////////////////////////////////////////////////

const getToken = () => {
    return localStorage.getItem(tokenKey);
};

const getTokenExpirationTime = token => {
    try {
        const decoded = decode(token);
        return decoded.exp;
    } catch (err) {
        return false;
    }
};

const isTokenExpired = token => {
    try {
        const tokenExpiration = getTokenExpirationTime(token);
        return tokenExpiration < Date.now() / 1000;
    } catch (err) {
        return false;
    }
};

// //////////////////////////////////////////////////////////////////////////////
function setToken(token) {
    localStorage.setItem(tokenKey, token);
}

function removeToken() {
    localStorage.removeItem(tokenKey);
}

// //////////////////////////////////////////////////////////////////////////////

// Checks if token is valid
const isAuthenticated = () => {
    const token = getToken();
    const result = token && !isTokenExpired(token);
    return result;
};

export { getToken, setToken, removeToken, isAuthenticated, getTokenExpirationTime };
