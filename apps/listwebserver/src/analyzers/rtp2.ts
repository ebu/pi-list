import { api } from '@bisect/ebu-list-sdk';
const influxDbManager = require('../managers/influx-db');
import { appendError } from './utils';
import * as constants from '../enums/analysis';
import { isArray, cloneDeep } from 'lodash';

export async function getDeltaRtpVsNtTicksRange(
    pcapId: string,
    stream: api.pcap.IStreamInfo
): Promise<api.pcap.IMinMaxAvg | null> {
    const value = await influxDbManager.getDeltaRtpVsNtTicksMinMax(pcapId, stream.id);

    if (!value.data || !isArray(value.data) || value.data.length < 1 || !value.data[0]) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no DeltaRtpVsNtTicksMinMax for stream `stream.id` in `pcapId`',
        });
        return null;
    }

    const { min, max, avg } = value.data[0];

    return { min, max, avg };
}

interface IVideoRtpValidation {
    rtp: {
        // See docs/video_timing_analysis.md
        deltaRtpTsVsNtLimit: {
            min: number;
            max: number;
        };
        deltaPktTsVsRtpTsLimit: {
            min: number;
            max: number;
        };
    };
}

export function getVideoRtpValidation(info: api.pcap.IST2110VideoInfo): IVideoRtpValidation {
    // TODO get from the validation profile
    const tro_default = info.tro_default_ns / 1000000000;
    const max_ticks_offset = tro_default * 90000;
    const validation: IVideoRtpValidation = {
        rtp: {
            // See docs/video_timing_analysis.md
            deltaRtpTsVsNtLimit: {
                min: -1,
                max: Math.ceil(max_ticks_offset) + 1,
            },
            deltaPktTsVsRtpTsLimit: {
                min: 0,
                max: 1000000,
            },
        },
    };

    return validation;
}

export function validateRtpTicks(
    stream: api.pcap.IStreamInfo,
    validation: IVideoRtpValidation,
    delta: api.pcap.IMinMaxAvg | null
): void {
    stream.analyses = stream.analyses ?? {};

    if (delta === null) {
        stream.analyses.rtp_ts_vs_nt = {
            result: 'not_compliant',
            details: {
                range: {
                    min: NaN,
                    max: NaN,
                    avg: NaN,
                },
                limit: { min: NaN, max: NaN },
                unit: 'ticks',
            },
        };

        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no value for "analyses.rtp_ts_vs_nt.details.range"',
        });

        return;
    }

    const limit = validation.rtp.deltaRtpTsVsNtLimit;

    const compliant = delta.min >= limit.min && delta.max <= limit.max;

    if (!compliant) {
        stream = appendError(stream, {
            id: constants.errors.invalid_rtp_ts_vs_nt,
        });
    }

    stream.analyses.rtp_ts_vs_nt = {
        result: compliant ? 'compliant' : 'not_compliant',
        details: {
            range: delta,
            limit: limit,
            unit: 'ticks',
        },
    };
}
