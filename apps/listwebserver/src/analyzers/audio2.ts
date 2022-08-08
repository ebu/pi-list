import { api } from '@bisect/ebu-list-sdk';
import { appendError } from './utils';
const constants = require('../enums/analysis');
const _ = require('lodash');

const x = api.pcap.isAudioStream;

// Returns true if the value is within the range
function checkRangeValue(value: number, limit: api.pcap.IAudioValueRangeUs): boolean {
    const min = limit[0];
    const max = limit[1];
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
}

function checkRange(range: api.pcap.IMinMaxAvg, limit: api.pcap.IAudioRtpProfileUs): boolean {
    if (!checkRangeValue(range.min, limit.min)) return false;
    if (!checkRangeValue(range.avg, limit.avg)) return false;
    if (!checkRangeValue(range.max, limit.max)) return false;
    return true;
}

const getPktTsVsRtpTsCompliance = (range: api.pcap.IMinMaxAvg, limit: api.pcap.IAudioRtpProfileUs) => ({
    result: checkRange(range, limit) ? constants.outcome.compliant : constants.outcome.not_compliant,
});

function toUsRange(packet_time_us: number, range: api.pcap.IAudioValueRange): api.pcap.IAudioValueRangeUs {
    if (range[2] === 'packet_time') {
        const min = range[0] === undefined ? undefined : range[0] * packet_time_us;
        const max = range[1] === undefined ? undefined : range[1] * packet_time_us;

        return [min, max];
    }

    return [range[0], range[1]];
}

const toUsProfile = (packet_time_us: number, profile: api.pcap.IAudioRtpProfile): api.pcap.IAudioRtpProfileUs => ({
    min: toUsRange(packet_time_us, profile.min),
    avg: toUsRange(packet_time_us, profile.avg),
    max: toUsRange(packet_time_us, profile.max),
});

export function updateStreamWithPktTsVsRtpTs(
    stream: api.pcap.IStreamInfo,
    range: api.pcap.IMinMaxAvg,
    profile: api.pcap.IAudioRtpProfile
) {
    if (!api.pcap.isAudioStream(stream) || !api.pcap.isIST2110AudioInfo(stream.media_specific)) {
        throw Error('Calling with a non-audio stream');
    }

    const audio_info = stream.media_specific;
    const global_audio_analysis = stream.global_audio_analysis ?? {};

    // convert to 'μs'
    const packet_time_us = parseFloat(audio_info.packet_time) * 1000;

    // TODO: we should use avg, not maxAvg
    const limitUs = toUsProfile(packet_time_us, profile);

    const packet_ts_vs_rtp_ts = {
        range: range,
        limit: limitUs,
        unit: 'μs',
    };
    global_audio_analysis['packet_ts_vs_rtp_ts'] = packet_ts_vs_rtp_ts;

    // TODO: maybe remove global_audio_analysis
    stream = _.set(stream, 'global_audio_analysis', global_audio_analysis);

    const { result } = getPktTsVsRtpTsCompliance(range, limitUs);
    const report = {
        result,
        details: packet_ts_vs_rtp_ts,
    };
    stream = _.set(stream, 'analyses.packet_ts_vs_rtp_ts', report);

    if (result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.audio_rtp_ts_not_compliant,
        });
    }

    return stream;
}
