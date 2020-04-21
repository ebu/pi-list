import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import asyncLoader from '../../../components/asyncLoader';
import api from '../../../utils/api';
import PcapSelector from './PcapSelector';
import StreamSelector from './StreamSelector';
import AudioChannelSelector from './AudioChannelSelector';
import notifications from '../../../utils/notifications';

const StreamSelectorPanel = props => {
    const [selectedPcapId, setSelectedPcapId] = useState(null);
    const [selectedStreamId, setSelectedStreamId] = useState(null);
    const [selectedAudioChannel, setSelectedAudioChannel] = useState(null);
    const [streams, setStreams] = useState([]);
    const [audioChannels, setAudioChannels] = useState([]);

    // Sort pcaps so that the most recent one is on top
    props.pcaps.sort((a, b) => (a.date < b.date ? 1 : a.date === b.date ? 0 : -1));

    useEffect(() => {
        if (!selectedPcapId) {
            return;
        }

        api.getStreamsFromPcap(selectedPcapId)
            .then(s => {
                setStreams(s);
                setSelectedStreamId(s[0].id);
                props.onChange({ pcap: selectedPcapId, stream: s[0].id, audioChannel: null });
            })
            .catch(e => {
                notifications.error({
                    titleTag: 'Could not get stream from Pcap',
                    messageTag: `${e}`,
                });
                console.error(`Error getting streams: ${e}`);
            });
    }, [selectedPcapId]);

    useEffect(() => {
        if (!selectedStreamId) {
            return;
        }
        api.getStreamInformation(selectedPcapId, selectedStreamId)
            .then(i => {
                if (i.media_type === 'audio') {
                    setAudioChannels(Array.from({ length: i.media_specific.number_channels }, (v, i) => 1 + i));
                    setSelectedAudioChannel(1);
                    props.onChange({ pcap: selectedPcapId, stream: selectedStreamId, audioChannel: 1 });
                } else {
                    setAudioChannels([]);
                    props.onChange({ pcap: selectedPcapId, stream: selectedStreamId, audioChannel: null });
                }
            })
            .catch(e => {
                notifications.error({
                    titleTag: 'Could not get streaminfo from id:',
                    messageTag: `${e}`,
                });
                console.error(`Error getting streams: ${e}`);
            });
    }, [selectedStreamId]);

    useEffect(() => {
        if (!selectedAudioChannel) {
            return;
        }
        props.onChange({ pcap: selectedPcapId, stream: selectedStreamId, audioChannel: selectedAudioChannel });
    }, [selectedAudioChannel]);

    // Dropdown callbacks
    const onChangePcap = e => {
        setSelectedPcapId(e.value);
    };

    const onStreamChange = e => {
        setSelectedStreamId(e.value);
    };

    const onChannelChange = e => {
        setSelectedAudioChannel(e.value);
    };

    return (
        <>
            <PcapSelector pcaps={props.pcaps} selectedPcapId={selectedPcapId} onChange={onChangePcap} />
            <StreamSelector streams={streams} selectedStreamId={selectedStreamId} onChange={onStreamChange} />

            {props.enableAudioChannelSelector && (
                <AudioChannelSelector
                    channels={audioChannels}
                    onChange={onChannelChange}
                    selectedChannel={selectedAudioChannel}
                />
            )}
        </>
    );
};

StreamSelectorPanel.propTypes = {
    onChange: PropTypes.func.isRequired,
    enableAudioChannelSelector: PropTypes.bool,
};

StreamSelectorPanel.defaultProps = {
    enableAudioChannelSelector: true,
};

export default asyncLoader(StreamSelectorPanel, {
    asyncRequests: {
        pcaps: () => api.getPcaps(),
    },
});
