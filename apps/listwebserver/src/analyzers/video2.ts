import { api } from '@bisect/ebu-list-sdk';
import { appendError } from './utils';
import * as constants from '../enums/analysis';

// Sets analyses.2110_21_vrx.result to compliant or not_compliant
// - if not compliant, adds and error to analyses.errors
export function map2110d21Vrx(stream: api.pcap.IStreamInfo): api.pcap.IStreamInfo {
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
export function map2110d21Cinst(stream: api.pcap.IStreamInfo): api.pcap.IStreamInfo {
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
