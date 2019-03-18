import React, { Fragment } from 'react';
import _ from 'lodash';
import InfoPane from './components/InfoPane';
import MinAvgMaxDisplay from './components/MinAvgMaxDisplay';
import DataList from './components/DataList';
import analysisConstants from '../../enums/analysis';

const isRtpCompliant = (info) => {
}

const getCompliance = (info) => {
    const v = _.get(info, ['analyses', 'rtp', 'result']);
    if (v === analysisConstants.outcome.compliant) {
        return { value: 'Compliant' };
        return { value: 'Not compliant' };
    }
};

const getTicksPropAsUs = (info, path) => {
    const v = _.get(info, path);
    if (v === null || v === undefined) return undefined;
    return (v * 1000000 / 90000).toFixed(0);
};

const RtpInfo = ({ info }) => {
    const delta_rtp_ts_vs_nt_min = getTicksPropAsUs(info, ['analyses', 'rtp', 'details', 'delta_rtp_ts_vs_nt_ticks', 'min']);
    const delta_rtp_ts_vs_nt_max = getTicksPropAsUs(info, ['analyses', 'rtp', 'details', 'delta_rtp_ts_vs_nt_ticks', 'max']);
    const delta_rtp_ts_vs_nt_avg = getTicksPropAsUs(info, ['analyses', 'rtp', 'details', 'delta_rtp_ts_vs_nt_ticks', 'avg']);

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
                        labelTag="media_information.rtp.delta_rtp_ts_vs_nt"
                        units="μs"
                        min={delta_rtp_ts_vs_nt_min}
                        max={delta_rtp_ts_vs_nt_max}
                        avg={delta_rtp_ts_vs_nt_avg}
                    />
                </div>
            </div>
        </div>
    );
};

export default RtpInfo;
