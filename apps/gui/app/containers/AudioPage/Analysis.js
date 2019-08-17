import React from 'react';
import InfoPane from '../streamPage/components/InfoPane';
import Button from '../../components/common/Button';
import AudioRtpInfo from './AudioRtpInfo';
import NetworkInfo from '../streamPage/NetworkInfo';
import AudioInfo from '../streamPage/AudioInfo';

const TsdfInfo = props => {
    const analysis = props.streamInfo.global_audio_analysis;
    const tsdf_max =
        analysis.tsdf.max === null || analysis.tsdf.max === undefined
            ? '---'
            : analysis.tsdf.max;
    const tsdf_limit = analysis.tsdf.limit;
    const tsdf_msg =
        tsdf_max > tsdf_limit ? `(out of range: > ${analysis.tsdf.limit})` : '';

    const values = [
        {
            labelTag: 'media_information.audio.tsdf_max',
            value: `${tsdf_max} ${tsdf_msg}`,
            units: 'μs',
        },
    ];

    return <InfoPane icon="queue_music" headingTag="TS-DF" values={values} />;
};

const Analysis = props => {
    const streamInfo = props.streamInfo;
    const statistics = streamInfo.statistics;

    return (
        <div>
            <div className="row">
                <div className="col-xs-12 col-md-6">
                    <AudioRtpInfo {...props} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <TsdfInfo {...props} />
                </div>
            </div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <NetworkInfo stream={props.streamInfo} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <AudioInfo
                        {...props.streamInfo.media_specific}
                        {...statistics}
                    />
                </div>
            </div>
            <hr />
            <Button
                    type="info"
                    label="Audio analysis explained"
                    onClick={() => {
                        window.open(
                            'https://github.com/ebu/pi-list/blob/master/docs/audio_timing_analysis.md',
                            '_blank'
                        );
                    }}
                />
        </div>
    );
};

export default Analysis;
