import React from 'react';
import Badge from 'components/common/Badge';
import { translateC } from 'utils/translation';

// todo: right now, just mocking this...
// we need to get this information from the server and change the status accordingly
const RealTimeDataStatus = (props) => {
    return (
        <Badge icon="check" text={translateC('realtime_feed.ok')} type="success" mini />
    );
};

export default RealTimeDataStatus;
