import React from 'react';
import Button from '../../components/common/Button';
import NetworkInfo from '../streamPage/NetworkInfo';
import AudioInfo from '../streamPage/AudioInfo';

const Summary = props => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;

    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <NetworkInfo stream={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <AudioInfo {...props.streamInfo.media_specific} {...statistics} />
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

export default Summary;
