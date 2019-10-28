import React from 'react';
import Button from '../../components/common/Button';
import NetworkInfo from './NetworkInfo';
import VideoInfo from './VideoInfo';
import AncillarySummary from './AncillarySummary';

const AncillaryStreamInformation = (props) => {
    const streamInfo = props.streamInfo;

    return (
        <div>
            <div className='row lst-full-height'>
                <div className='col-xs-12 col-md-4'>
                    <NetworkInfo stream={ props.streamInfo } />
                </div>
                <div className='col-xs-12 col-md-4'>
                    <VideoInfo {...streamInfo.media_type} {...streamInfo.media_specific} {...streamInfo.statistics} />
                </div>
                <div className='col-xs-12 col-md-4'>
                    <AncillarySummary  {...props} />
                </div>
            </div>
            <hr />
            <Button
                    type="info"
                    label="Ancillary analysis explained"
                    onClick={() => {
                        window.open(
                            'https://github.com/ebu/pi-list/blob/master/docs/ancillary_data.md',
                            '_blank'
                        );
                    }}
                />
        </div>
    );
};

export default AncillaryStreamInformation;
