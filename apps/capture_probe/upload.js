const fs = require('fs');
const request = require('request');
const { promisify } = require('util');
const requestPut = promisify(request.put);

///////////////////////////////////////////////////////////////////////////////

const uploadFile = async (sourceFile, ingestPutUrl, authorization, filename) => {
    const putResult = await requestPut({
        url: ingestPutUrl,
        headers: {
            'User-Agent': 'request',
            'Authorization': authorization
        },
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
    uploadFile,
};
