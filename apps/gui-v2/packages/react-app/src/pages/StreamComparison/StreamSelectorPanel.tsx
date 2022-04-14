import React from 'react';
import list from '../../utils/api';
import { Notification } from 'components/index';
import { StreamSelector, PCapSelector, AudioChannelSelector } from 'components/index';

interface IComponentProps {
    pcaps: any;
    onChange: ({}) => void;
    enableAudioChannelSelector: boolean;
    isAudioStream: boolean;
}

function StreamSelectorPanel({ pcaps, onChange, enableAudioChannelSelector, isAudioStream }: IComponentProps) {
    const [selectedPcapId, setSelectedPcapId] = React.useState<string>('');
    const [selectedStreamId, setSelectedStreamId] = React.useState<string>('');
    const [selectedAudioChannel, setSelectedAudioChannel] = React.useState<any>();
    const [streams, setStreams] = React.useState([]);
    const [audioChannels, setAudioChannels] = React.useState<any[]>([]);

    React.useEffect(() => {
        if (!selectedPcapId) {
            return;
        }

        list.pcap
            .getStreams(selectedPcapId)
            .then((s: any) => {
                setStreams(s);
                setSelectedStreamId(s[0].id);
                onChange({ pcap: selectedPcapId, stream: s[0].id, audioChannel: null });
            })
            .catch(e => {
                Notification({
                    typeMessage: 'error',
                    message: (
                        <div>
                            <p>Could not get stream from Pcap</p>
                            <p> {e} </p>
                        </div>
                    ),
                });
                console.error(`Error getting streams: ${e}`);
            });
    }, [selectedPcapId]);

    React.useEffect(() => {
        if (!selectedStreamId) {
            return;
        }
        list.stream
            .getStreamInfo(selectedPcapId, selectedStreamId)
            .then((i: any) => {
                if (i.media_type === 'audio') {
                    const audioChannelsArray = Array.from(
                        { length: i.media_specific.number_channels },
                        (v, i) => 1 + i
                    );
                    const audioChannelsToSelector = audioChannelsArray.map((channel, i) => ({
                        label: `Channel ${channel}`,
                        value: channel,
                    }));
                    setAudioChannels(audioChannelsToSelector);
                    setSelectedAudioChannel(1);
                    onChange({ pcap: selectedPcapId, stream: selectedStreamId, audioChannel: 1 });
                } else {
                    setAudioChannels([]);
                    onChange({ pcap: selectedPcapId, stream: selectedStreamId, audioChannel: null });
                }
            })
            .catch((e: React.ReactNode) => {
                Notification({
                    typeMessage: 'error',
                    message: (
                        <div>
                            <p>Could not get streaminfo from id:</p>
                            <p> {e} </p>
                        </div>
                    ),
                });
                console.error(`Error getting streams: ${e}`);
            });
    }, [selectedStreamId]);

    React.useEffect(() => {
        if (!selectedAudioChannel) {
            return;
        }
        onChange({ pcap: selectedPcapId, stream: selectedStreamId, audioChannel: selectedAudioChannel });
    }, [selectedAudioChannel]);

    // Dropdown callbacks
    const onChangePcap = (e: any) => {
        setSelectedPcapId(e.value);
    };

    const onStreamChange = (e: any) => {
        setSelectedStreamId(e.value);
    };

    const onChannelChange = (e: any) => {
        setSelectedAudioChannel(e.value);
    };

    return (
        <>
            <PCapSelector pcaps={pcaps} selectedPcapId={selectedPcapId} onChange={onChangePcap} />
            {selectedPcapId && (
                <StreamSelector streams={streams} selectedStreamId={selectedStreamId} onChange={onStreamChange} />
            )}
            {/* Test this */}
            {isAudioStream && enableAudioChannelSelector && (
                <AudioChannelSelector
                    channels={audioChannels}
                    onChange={onChannelChange}
                    selectedChannel={selectedAudioChannel}
                />
            )}
        </>
    );
}

export default StreamSelectorPanel;
