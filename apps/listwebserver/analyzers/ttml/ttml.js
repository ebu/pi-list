const _ = require('lodash');
const path = require('path');
const Stream = require('../../models/stream');
const { doLoadTtmlDocuments, doAnalyseTimeBase, doAnalyseSequenceIdentifier } = require('./util');
const { getUserId } = require('../../auth/middleware');

// stream structure:
//  media_specific:
//      data: [{
//          valid: true | false,
//          ts: <rtp timestamp>,
//          doc: <xml doc>,
//          timeBase : string,
//          sequenceIdentifier : string,
//          body : Object, // the whole contents of the <body> element, in JSON
//      },
//]

// For some reason, getUserFolder can't be imported...
//const { getUserFolder, } = require('../util/analysis');
function getUserFolder(req) {
    const program = require('../../util/programArguments');
    const userId = getUserId(req);
    return `${program.folder}/${userId}`;
}

// sync
const loadTtmlDocuments = (req, stream) => {
    const ttmlFilesPath = path.join(getUserFolder(req), req.pcap.uuid, stream.id, 'ttml-data');
    return doLoadTtmlDocuments(ttmlFilesPath, stream);
};

const doTtmlStreamAnalysis = async (req, stream) => {
    loadTtmlDocuments(req, stream);
    doAnalyseTimeBase(stream);
    doAnalyseSequenceIdentifier(stream);
    return await Stream.findOneAndUpdate({ id: stream.id }, stream, {
        new: true,
    });
};

const doTtmlAnalysis = (req, streams) => {
    const promises = streams.map(stream => doTtmlStreamAnalysis(req, stream));
    return Promise.all(promises);
};

module.exports = {
    doTtmlAnalysis,
};
