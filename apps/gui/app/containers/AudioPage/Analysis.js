import React from 'react';
import AudioRtpInfo from './AudioRtpInfo';
import TsdfInfo from './TsdfInfo';
import Button from '../../components/common/Button';

const Analysis = props => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;

    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <AudioRtpInfo {...props} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <TsdfInfo {...props} />
                </div>
            </div>
            <hr />
            <Button
                type="info"
                label="Audio analysis explained"
                onClick={() => {
                    window.open('https://github.com/ebu/pi-list/blob/master/docs/audio_timing_analysis.md', '_blank');
                }}
            />
        </div>
    );
};

export default Analysis;
