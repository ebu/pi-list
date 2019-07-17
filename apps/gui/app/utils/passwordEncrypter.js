function xorEncrypt(key, str) {
    return str
        .split('')
        .map((char, index) => {
            return String.fromCharCode(
                str.charCodeAt(index) ^ key.charCodeAt(index % key.length)
            );
        })
        .join('');
}

function encrypt(password, token) {
    const finalToken = token.replace(/[a-z]/g, '');

    const encodedPassword = `${password}.${finalToken}`;

    return btoa(`${token}.${btoa(xorEncrypt(finalToken, encodedPassword))}`);
}

export default encrypt;
