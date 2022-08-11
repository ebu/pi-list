import { api, AnalysisNames, makeAnalysisName } from '@bisect/ebu-list-sdk';
import { appendError } from './utils';
import * as constants from '../enums/analysis';
const _ = require('lodash');
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
import { getPitRangeForStream } from '../controllers/streams';

export function getTsdfMax(range?: api.pcap.IMinMax[]): number | null {
    if (range === undefined || range[0] === undefined) return null;
    return range[0].max;
}

interface ITsdfInfo {
    max: number;
    tolerance: number;
    limit: number;
}

export function getTsdfCompliance(tsdf?: ITsdfInfo): {
    level: 'narrow' | 'wide' | 'not_compliant';
    result: api.pcap.Compliance | 'undefined';
} {
    if (tsdf === undefined || tsdf.max === undefined)
        return {
            result: 'undefined',
            level: 'not_compliant',
        };
    if (tsdf.max < tsdf.tolerance)
        return {
            result: 'compliant',
            level: 'narrow',
        };

    if (tsdf.max > tsdf.limit)
        return {
            result: 'not_compliant',
            level: 'not_compliant',
        };

    return {
        result: 'compliant',
        level: 'wide',
    };
}

export function updateStreamWithTsdfMax(
    stream: api.pcap.IStreamInfo,
    tsdfMax: number,
    tsdfProfile: api.pcap.ITsdfProfile
): api.pcap.IStreamInfo {
    if (!api.pcap.isAudioStream(stream) || !api.pcap.isIST2110AudioInfo(stream.media_specific)) {
        throw Error('Calling with a non-audio stream');
    }

    const packetTime = packetTimeAsUs(stream.media_specific);

    const tsdfInfo = {
        max: tsdfMax,
        tolerance: packetTime * tsdfProfile.tolerance,
        limit: packetTime * tsdfProfile.limit,
        unit: 'μs' as 'μs',
    };
    const { result, level } = getTsdfCompliance(tsdfInfo);

    const tsdf: api.pcap.ITsdfGlobalDetails = {
        ...tsdfInfo,
        compliance: result,
        level: level,
        result: result,
    };

    stream.global_audio_analysis = stream.global_audio_analysis ?? {};
    stream.global_audio_analysis[AnalysisNames.tsdf] = tsdf;

    const report = {
        result,
        details: tsdf,
    };
    stream = _.set(stream, makeAnalysisName(AnalysisNames.tsdf), report);

    if (result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.tsdf_not_compliant,
        });
    }

    return stream;
}

// Returns true if the value is within the range
function checkRangeValue(value: number, limit: api.pcap.IAudioValueRangeUs): boolean {
    const min = limit.min;
    const max = limit.max;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
}

function checkRange(range: api.pcap.IMinMaxAvg, limit: api.pcap.IMinMaxAvgUsRanges): boolean {
    if (!checkRangeValue(range.min, limit.min)) return false;
    if (!checkRangeValue(range.avg, limit.avg)) return false;
    if (!checkRangeValue(range.max, limit.max)) return false;
    return true;
}

const getRangeCompliance = (
    range: api.pcap.IMinMaxAvg,
    limit: api.pcap.IMinMaxAvgUsRanges | undefined
): api.pcap.Compliance => (limit === undefined ? 'disabled' : checkRange(range, limit) ? 'compliant' : 'not_compliant');

function toUsRange(packet_time_us: number, range: api.pcap.IAudioValueRange): api.pcap.IAudioValueRangeUs {
    if (range.unit === 'packet_time') {
        const min = range.min === undefined ? undefined : range.min * packet_time_us;
        const max = range.max === undefined ? undefined : range.max * packet_time_us;

        return { min, max };
    }

    return { min: range.min, max: range.max };
}

const toUsProfile = (packet_time_us: number, profile: api.pcap.IMinMaxAvgRanges): api.pcap.IMinMaxAvgUsRanges => ({
    min: toUsRange(packet_time_us, profile.min),
    avg: toUsRange(packet_time_us, profile.avg),
    max: toUsRange(packet_time_us, profile.max),
});

const packetTimeAsUs = (audioInfo: api.pcap.IST2110AudioInfo): number => parseFloat(audioInfo.packet_time) * 1000;

export function updateStreamWithPktTsVsRtpTs(
    stream: api.pcap.IStreamInfo,
    range: api.pcap.IMinMaxAvg,
    profile: api.pcap.IAudioRtpProfile
) {
    if (!api.pcap.isAudioStream(stream) || !api.pcap.isIST2110AudioInfo(stream.media_specific))
        throw Error('Calling with a non-audio stream');

    // TODO: we should use avg, not maxAvg
    const limitUs = toUsProfile(packetTimeAsUs(stream.media_specific), profile);

    const packet_ts_vs_rtp_ts = {
        range: range,
        limit: limitUs,
        unit: 'μs' as api.pcap.AudioTimeUnit,
    };

    stream.global_audio_analysis = stream.global_audio_analysis ?? {};
    stream.global_audio_analysis[AnalysisNames.packet_ts_vs_rtp_ts] = packet_ts_vs_rtp_ts;

    const result = getRangeCompliance(range, limitUs);
    const report = {
        result,
        details: packet_ts_vs_rtp_ts,
    };

    stream.analyses = stream.analyses ?? {};
    stream.analyses.packet_ts_vs_rtp_ts = report;

    if (result === 'not_compliant') {
        stream = appendError(stream, {
            id: constants.errors.audio_rtp_ts_not_compliant,
        });
    }

    return stream;
}

function calculateTsdfFromRange(
    stream: api.pcap.IStreamInfo,
    range: any,
    tsdfProfile: api.pcap.ITsdfProfile
): api.pcap.IStreamInfo {
    const tsdfMax = getTsdfMax(range);
    if (tsdfMax === null) return stream;
    return updateStreamWithTsdfMax(stream, tsdfMax, tsdfProfile);
}

async function doCalculateTsdf(pcapId: string, stream: api.pcap.IStreamInfo, tsdfProfile: api.pcap.ITsdfProfile) {
    const range = await influxDbManager.getAudioTimeStampedDelayFactorRange(pcapId, stream.id);
    delete range.data.time;
    return calculateTsdfFromRange(stream, range.data, tsdfProfile);
}

async function doCalculatePktTsVsRtpTsRange(
    pcapId: string,
    stream: api.pcap.IStreamInfo,
    rtpProfile: api.pcap.IAudioRtpProfile
) {
    const range = await influxDbManager.getAudioPktTsVsRtpTsRange(pcapId, stream.id);
    return await updateStreamWithPktTsVsRtpTs(stream, range.data[0], rtpProfile);
}

async function doLoadPit(
    userId: string,
    pcapId: string,
    stream: api.pcap.IStreamInfo
): Promise<api.pcap.MinMaxAvgUsRange> {
    return getPitRangeForStream(userId, pcapId, stream.id);
}

function addPitAnalysis(
    stream: api.pcap.IStreamInfo,
    pitRange: api.pcap.MinMaxAvgUsRange,
    profile?: api.pcap.IAudioPitProfile
) {
    if (!api.pcap.isAudioStream(stream) || !api.pcap.isIST2110AudioInfo(stream.media_specific))
        throw Error('Calling with a non-audio stream');

    const limit = profile !== undefined ? toUsProfile(packetTimeAsUs(stream.media_specific), profile) : undefined;

    if (limit == undefined) return;

    const result = getRangeCompliance(pitRange, limit);

    const analysis: api.pcap.IAudioPitAnalysis = {
        // TODO: validate
        result,
        details: {
            range: pitRange,
            limit: limit,
        },
    };
    stream.analyses[AnalysisNames.pit] = analysis;

    if (result === 'not_compliant') {
        stream = appendError(stream, {
            id: constants.errors.audio_pit_not_compliant,
        });
    }
}

// Returns one promise, which result is undefined.
async function doAudioStreamAnalysis(
    userId: string,
    pcapId: string,
    stream: api.pcap.IStreamInfo,
    audioAnalysisProfile: api.pcap.IAudioAnalysisProfile
) {
    stream.global_audio_analysis = stream.global_audio_analysis ?? {};

    await doCalculateTsdf(pcapId, stream, audioAnalysisProfile.tsdf);
    addPitAnalysis(stream, await doLoadPit(userId, pcapId, stream), audioAnalysisProfile.pit);
    const info = await doCalculatePktTsVsRtpTsRange(pcapId, stream, audioAnalysisProfile.deltaPktTsVsRtpTsLimit);

    return await Stream.findOneAndUpdate(
        {
            id: stream.id,
        },
        info,
        {
            new: true,
        }
    );
}

// Returns one array with a promise for each stream. The result of the promise is undefined.
export async function doAudioAnalysis(
    userId: string,
    pcapId: string,
    streams: api.pcap.IStreamInfo[],
    audioAnalysisProfile: api.pcap.IAudioAnalysisProfile
) {
    const promises = streams.map((stream: api.pcap.IStreamInfo) =>
        doAudioStreamAnalysis(userId, pcapId, stream, audioAnalysisProfile)
    );
    return Promise.all(promises);
}

module.exports = {
    doAudioAnalysis,
};
