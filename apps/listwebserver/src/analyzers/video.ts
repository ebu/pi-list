import { api } from '@bisect/ebu-list-sdk';
import { appendError } from './utils';
import { selectAnalyses } from './utils2';
import * as constants from '../enums/analysis';
import {
    validateRtpTicks,
    getDeltaRtpVsNtTicksRange,
    getVideoDeltaRtpTsVsNtLimit,
    getVideoDeltaPktTsVsRtpTsLimit,
    doRtpTsAnalysis,
    validateRtpTs,
    doInterFrameRtpTsDeltaAnalysis,
    validateInterFrameRtpTsDelta,
} from './rtp';

const Stream = require('../models/stream');

// Sets analyses.2110_21_vrx.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function map2110d21Vrx(stream: api.pcap.IStreamInfo): api.pcap.IStreamInfo {
    if (stream.full_media_type !== 'video/raw') {
        // VRX is only valid for ST2110-20 streams
        return stream;
    }

    const compliance = stream.global_video_analysis?.vrx?.compliance;
    stream.analyses = stream.analyses ?? {};

    if (compliance === 'not_compliant') {
        stream.analyses['2110_21_vrx'] = {
            result: 'not_compliant',
        };

        stream = appendError(stream, {
            id: constants.errors.vrx_above_maximum,
        });
    } else {
        stream.analyses['2110_21_vrx'] = {
            result: 'compliant',
        };
    }

    return stream;
}

// Sets analyses.2110_21_cinst.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
function map2110d21Cinst(stream: api.pcap.IStreamInfo): api.pcap.IStreamInfo {
    const compliance = stream.global_video_analysis?.cinst?.compliance;
    stream.analyses = stream.analyses ?? {};

    if (compliance === 'not_compliant') {
        stream.analyses['2110_21_cinst'] = {
            result: 'not_compliant',
        };

        stream = appendError(stream, {
            id: constants.errors.cinst_above_maximum,
        });
    } else {
        stream.analyses['2110_21_cinst'] = {
            result: 'compliant',
        };
    }

    return stream;
}

async function doVideoStreamAnalysis(pcapId: string, stream: api.pcap.IStreamInfo, profile: api.pcap.IAnalysisProfile) {
    const analyses = selectAnalyses(stream.media_type, stream.full_media_type, profile);

    if (analyses.rtp_ts_vs_nt) {
        const deltaRtpTsVsNtLimit = getVideoDeltaRtpTsVsNtLimit(
            stream.media_specific as api.pcap.IST2110VideoInfo,
            analyses.rtp_ts_vs_nt
        );
        const deltaRange = await getDeltaRtpVsNtTicksRange(pcapId, stream);
        validateRtpTicks(stream, deltaRtpTsVsNtLimit, deltaRange);
    }

    await doRtpTsAnalysis(pcapId, stream);
    const deltaPktTsVsRtpTsLimit = getVideoDeltaPktTsVsRtpTsLimit();
    validateRtpTs(stream, deltaPktTsVsRtpTsLimit);
    await doInterFrameRtpTsDeltaAnalysis(pcapId, stream);
    validateInterFrameRtpTsDelta(stream);
    map2110d21Cinst(stream);

    if (stream.full_media_type === 'video/raw') {
        map2110d21Vrx(stream);
    }

    return await Stream.findOneAndUpdate(
        {
            id: stream.id,
        },
        stream,
        {
            new: true,
        }
    );
}

// Returns one array with a promise for each stream. The result of the promise is undefined.
export async function doVideoAnalysis(
    pcapId: string,
    streams: api.pcap.IStreamInfo[],
    profile: api.pcap.IAnalysisProfile
) {
    const promises = streams.map((stream) => doVideoStreamAnalysis(pcapId, stream, profile));
    return Promise.all(promises);
}
