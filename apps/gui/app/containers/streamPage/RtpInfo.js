import React, { Fragment } from 'react';
import _ from 'lodash';
import InfoPane from './components/InfoPane';
import MinAvgMaxDisplay from './components/MinAvgMaxDisplay';
import DataList from './components/DataList';
import analysisConstants from '../../enums/analysis';

const isRtpCompliant = (info) => {
}

const getCompliance = (info) => {
    const v = _.get(info, ['analyses', 'packet_ts_vs_rtp_ts', 'result']);
    if (v === analysisConstants.outcome.compliant) {
        return { value: 'Compliant' };
    }
    return { value: 'Not compliant' };
};

const nsPropAsMinMaxAvgUs = (info) => {
    if (_.isNil(info)) return { min: '---', max: '---', avg: '---'};
    const toUs = v => _.isNil(v) ? '---' : (v / 1000).toFixed(0);
    return { min: toUs(info.min), max: toUs(info.max), avg: toUs(info.avg)};
};

const propAsMinMaxAvg = (info) => {
    if (_.isNil(info)) return { min: '---', max: '---', avg: '---'};
    return { min: info.min, max: info.max, avg: info.avg};
};

const RtpInfo = ({ info }) => {
    const delta_packet_time_vs_rtp_time_ns = _.get(info, ['analyses', 'packet_ts_vs_rtp_ts', 'details', 'delta_packet_time_vs_rtp_time_ns'], undefined);
    const delta_rtp_ts_vs_nt = _.get(info, ['analyses', 'rtp_ticks', 'details', 'delta_rtp_ts_vs_nt_ticks'], undefined);

    const summaryValues = [
        {
            labelTag: 'stream.compliance',
            ...getCompliance(info)
        },
    ];

    return (
        <div>
            <InfoPane
                icon="blur_linear"
                heading="RTP"
                values={[]}
            />
            <div className="row">
                <div className="col-xs-12">
                    <DataList values={summaryValues} />
                </div>
            </div>
            <div className="row">
            <div className="col-xs-12">
                    <MinAvgMaxDisplay
                        labelTag="media_information.rtp.delta_packet_time_vs_rtp_time_ns"
                        units="μs"
                        {...nsPropAsMinMaxAvgUs(delta_packet_time_vs_rtp_time_ns)}
                    />
                </div>
                <div className="col-xs-12">
                    <MinAvgMaxDisplay
                        labelTag="media_information.rtp.delta_rtp_ts_vs_nt"
                        units="ticks"
                        {...propAsMinMaxAvg(delta_rtp_ts_vs_nt)}
                    />
                </div>
            </div>
        </div>
    );
};

export default RtpInfo;
