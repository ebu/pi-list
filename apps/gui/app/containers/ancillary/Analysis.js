import React from 'react';
import Button from '../../components/common/Button';
import RtpInfo from './RtpInfo';
import AncillarySummary from './AncillarySummary';

const Analysis = props => {
    const streamInfo = props.streamInfo;

    return (
        <div>
            <div className="row lst-full-height">
                <div className="col-xs-12 col-md-6">
                    <RtpInfo {...props} />
                </div>
                <div className="col-xs-12 col-md-6">
                    <AncillarySummary {...props} />
                </div>
            </div>
            <hr />
            <Button
                type="info"
                label="Ancillary analysis explained"
                onClick={() => {
                    window.open('https://github.com/ebu/pi-list/blob/master/docs/ancillary_data.md', '_blank');
                }}
            />
        </div>
    );
};

export default Analysis;
