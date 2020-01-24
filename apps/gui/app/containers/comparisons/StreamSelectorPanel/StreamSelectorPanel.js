import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import asyncLoader from '../../../components/asyncLoader';
import api from '../../../utils/api';
import PcapSelector from './PcapSelector';
import StreamSelector from './StreamSelector';
import notifications from '../../../utils/notifications';

const StreamSelectorPanel = props => {
    const [selectedPcapId, setSelectedPcapId] = useState(null);
    const [selectedStreamId, setSelectedStreamId] = useState(null);
    const [streams, setStreams] = useState([]);

    useEffect(() => {
        if (!selectedPcapId) {
            return;
        }

        api.getStreamsFromPcap(selectedPcapId)
            .then(s => setStreams(s))
            .catch(e => {
                notifications.error({
                    titleTag: 'Could not get stream from Pcap',
                    messageTag: `${e}`
                });
                console.error(`Error getting streams: ${e}`)
            });
    }, [selectedPcapId]);

    const onChangePcap = e => {
        setSelectedPcapId(e.value);
        setSelectedStreamId(null);

        props.onChange({ pcap: e.value, stream: null });
    };

    const onStreamChange = e => {
        setSelectedStreamId(e.value);

        props.onChange({ pcap: selectedPcapId, stream: e.value });
    };

    return (
        <>
            <div className="row lst-align-items-center">
                <div className="col-xs-12">
                    <PcapSelector pcaps={props.pcaps} selectedPcapId={selectedPcapId} onChange={onChangePcap} />
                </div>
                <div className="col-xs-12">
                    <StreamSelector streams={streams} onChange={onStreamChange} selectedStreamId={selectedStreamId} />
                </div>
            </div>
        </>
    );
};

StreamSelectorPanel.propTypes = {
    onChange: PropTypes.func.isRequired,
};

export default asyncLoader(StreamSelectorPanel, {
    asyncRequests: {
        pcaps: () => api.getPcaps(),
    },
});
