const _ = require('lodash');
const Stream = require('../models/stream');

const {
    doRtpTsAnalysis,
    validateRtpTs,
    doInterFrameRtpTsDeltaAnalysis,
    validateInterFrameRtpTsDelta,
} = require('./rtp');

const {
    validateRtpTicks,
    getDeltaRtpVsNtTicksRange,
    getVideoRtpValidation
} = require('./rtp2');

const {
    map2110d21Vrx,
    map2110d21Cinst
} = require('./video2');



const doVideoStreamAnalysis = async (pcapId, stream) => {
    if (stream.full_media_type === 'video/raw') {
        const deltaRange = await getDeltaRtpVsNtTicksRange(pcapId, stream);
        const rtp_validation = getVideoRtpValidation(stream.media_specific);
        await validateRtpTicks(stream, rtp_validation, deltaRange);
        await doRtpTsAnalysis(pcapId, stream);
        await validateRtpTs(stream, rtp_validation);
        await doInterFrameRtpTsDeltaAnalysis(pcapId, stream);
        await validateInterFrameRtpTsDelta(stream);
        await map2110d21Cinst(stream);
        await map2110d21Vrx(stream);
    }

    return await Stream.findOneAndUpdate({
        id: stream.id
    }, stream, {
        new: true,
    });
};

// Returns one array with a promise for each stream. The result of the promise is undefined.
function doVideoAnalysis(pcapId, streams) {
    const promises = streams.map((stream) => doVideoStreamAnalysis(pcapId, stream));
    return Promise.all(promises);
}

module.exports = {
    doVideoAnalysis,
};