const fs = require('fs');
const request = require('request');
const { promisify } = require('util');
const requestPut = promisify(request.put);

///////////////////////////////////////////////////////////////////////////////

const uploadFile = async (sourceFile, ingestPutUrl, cookies, filename) => {
    const j = request.jar();
    Object.keys(cookies).forEach(key => {
        const cookie = request.cookie(`${key}=${cookies[key]}`);
        j.setCookie(cookie, ingestPutUrl);
    });

    const putResult = await requestPut({
        url: ingestPutUrl,
        jar: j,
        formData: {
            pcap: fs.createReadStream(sourceFile),
            originalFilename: filename,
        },
    });

    if (putResult.statusCode !== 201) {
        throw new Error(
            `Error uploading file: ${putResult.statusMessage}\n${
                putResult.body
            }`
        );
    }
};

module.exports = {
    uploadFile
};
