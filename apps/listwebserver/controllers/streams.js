const _ = require('lodash');
const Stream = require('../models/stream');
const { updateStreamWithTsdfMax } = require('../analyzers/audio');
const { addRtpSequenceAnalysisToStream } = require('../analyzers/rtp');

function upgradeTsdfAnalysis(stream) {
    const tsdfAnalysis = _.get(stream, ['analyses', 'tsdf']);
    if (tsdfAnalysis) return stream;

    const tsdfMax = _.get(stream, ['global_audio_analysis', 'tsdf_max']);
    return updateStreamWithTsdfMax(stream, tsdfMax);
}

function upgradeStreamInfo(stream) {
    if (!stream) return stream;

    if (stream.media_type == "audio") {
        stream = upgradeTsdfAnalysis(stream);
    }
    stream = addRtpSequenceAnalysisToStream(stream);

    return stream;
}

function getStreamWithId(id) {
    return Stream.findOne({ id }).exec()
        .then(stream => upgradeStreamInfo(stream));
}

function getStreamsForPcap(pcapId) {
    return Stream.find({ pcap: pcapId }).exec();
}

module.exports = {
    getStreamWithId,
    getStreamsForPcap
};
