import { api } from '@bisect/ebu-list-sdk';
import _ from 'lodash';
const influxDbManager = require('../managers/influx-db');
const Stream = require('../models/stream');
import { appendError } from './utils';
import * as constants from '../enums/analysis';
import { isArray, cloneDeep } from 'lodash';
import { IMinMax } from '@bisect/ebu-list-sdk/dist/api/pcap';

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

export function getVideoDeltaRtpTsVsNtLimit(
    info: api.pcap.IST2110VideoInfo,
    validation?: api.pcap.IRtpOffsetValidation
): api.pcap.IMinMax | undefined {
    if (validation === undefined) return undefined;

    if (validation.type == 'use_troffset') {
        const tro_default = info.tro_default_ns / 1000000000;
        const max_ticks_offset = tro_default * 90000;
        return {
            min: -1,
            max: Math.ceil(max_ticks_offset) + 1,
        };
    }

    return validation.limit;
}

export function getVideoDeltaPktTsVsRtpTsLimit(): api.pcap.IMinMax {
    return {
        min: 0,
        max: 1000000,
    };
}

export function validateRtpTicks(
    stream: api.pcap.IStreamInfo,
    limit: IMinMax,
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

export async function doRtpTsAnalysis(pcapId: string, stream: api.pcap.IStreamInfo): Promise<api.pcap.IStreamInfo> {
    const value = await influxDbManager.getDeltaPacketTimeVsRtpTimeMinMax(pcapId, stream.id);

    if (_.isNil(value.data) || value.data.length < 1 || _.isNil(value.data[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no DeltaPacketTimeVsRtpTimeMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const { min, max, avg } = value.data[0];
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.range', {
        min,
        max,
        avg,
    });

    return stream;
}

function getResult(dropped_packets: number | undefined): api.pcap.Compliance {
    if (dropped_packets === undefined) return 'undefined';
    if (dropped_packets === 0) return 'compliant';
    return 'not_compliant';
}

function addRtpSequenceAnalysisToStream(stream: api.pcap.IStreamInfo) {
    const dropped_packets_count = stream.statistics?.dropped_packet_count;
    const dropped_packets_samples = stream.statistics?.dropped_packet_samples;
    const packet_count = stream.statistics?.packet_count;

    const report = {
        result: getResult(dropped_packets_count),
        details: {
            dropped_packets_count,
            dropped_packets_samples,
            packet_count,
        },
    };

    if (report.result === constants.outcome.not_compliant) {
        stream = appendError(stream, {
            id: constants.errors.dropped_packets,
        });
    }

    return _.set(stream, 'analyses.rtp_sequence', report);
}

// Returns one promise, which result is undefined.
export async function doRtpStreamAnalysis(stream: api.pcap.IStreamInfo) {
    const s = addRtpSequenceAnalysisToStream(stream);

    await Stream.findOneAndUpdate(
        {
            id: stream.id,
        },
        s,
        {
            new: true,
        }
    );
}

export function validateRtpTs(stream: api.pcap.IStreamInfo, limit: api.pcap.IMinMax): api.pcap.IStreamInfo {
    const delta = _.get(stream, 'analyses.packet_ts_vs_rtp_ts.details.range', null);

    if (delta === null) {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no value for "analyses.packet_ts_vs_rtp_ts.details.range"',
        });

        return stream;
    }
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.limit', limit);
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.details.unit', 'ns');

    const { min, max } = delta;
    _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
    if (min < limit.min || max > limit.max) {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.invalid_delta_packet_ts_vs_rtp_ts,
        });
    } else {
        _.set(stream, 'analyses.packet_ts_vs_rtp_ts.result', constants.outcome.compliant);
    }

    return stream;
}

export async function doInterFrameRtpTsDeltaAnalysis(
    pcapId: string,
    stream: api.pcap.IStreamInfo
): Promise<api.pcap.IStreamInfo> {
    const value = await influxDbManager.getDeltaToPreviousRtpTsMinMax(pcapId, stream.id);

    if (_.isNil(value.data) || value.data.length < 1 || _.isNil(value.data[0])) {
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no DeltaToPreviousRtpTsMinMax for stream `stream.id` in `pcapId`',
        });
        return stream;
    }

    const { min, max, avg } = value.data[0];
    _.set(stream, 'analyses.inter_frame_rtp_ts_delta.details.range', {
        min,
        max,
        avg,
    });

    return stream;
}

function getInterFrameRtpTsDeltaLimit(stream: api.pcap.IStreamInfo): api.pcap.IMinMax | null {
    var rate;

    if (_.get(stream, 'statistics.rate', null) !== null) {
        rate = _.get(stream, 'statistics.rate', null);
    } else if (_.get(stream, 'media_specific.rate', null) !== null) {
        rate = _.get(stream, 'media_specific.rate', null);
    } else {
        return null;
    }

    const rtpClockRate = 90000;
    const interTicks = rtpClockRate / eval(rate);

    return {
        min: Math.floor(interTicks),
        max: Math.ceil(interTicks),
    };
}

export function validateInterFrameRtpTsDelta(stream: api.pcap.IStreamInfo): api.pcap.IStreamInfo {
    const delta = _.get(stream, 'analyses.inter_frame_rtp_ts_delta.details.range', null);

    if (delta === null) {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'no value for "analyses.inter_frame_rtp_ts_delta.details.range"',
        });

        return stream;
    }

    const limit = getInterFrameRtpTsDeltaLimit(stream);
    if (limit === null) {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.missing_information,
            value: 'could not calculate the limits',
        });

        return stream;
    }

    _.set(stream, 'analyses.inter_frame_rtp_ts_delta.details.limit', limit);
    _.set(stream, 'analyses.inter_frame_rtp_ts_delta.details.unit', 'ticks');

    const { min, max } = delta;
    if (min < limit.min || max > limit.max) {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.not_compliant);
        stream = appendError(stream, {
            id: constants.errors.invalid_inter_frame_rtp_ts_delta,
        });
    } else {
        _.set(stream, 'analyses.inter_frame_rtp_ts_delta.result', constants.outcome.compliant);
    }

    return stream;
}
