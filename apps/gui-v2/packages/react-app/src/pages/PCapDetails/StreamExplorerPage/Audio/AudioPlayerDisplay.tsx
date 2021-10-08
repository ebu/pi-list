import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import CheckboxListHOC from './CheckboxListHOC';
import list from '../../../../utils/api';
import { translate } from '../../../../utils/translation';
import AudioPlayer from './AudioPlayer';
import { ButtonAudioPlayer } from 'components/index';
import eventsAudioPlayer from '../../../../enums/eventsAudioPlayer';
const getChannelsString = (selectedChannels: any) =>
    Object.keys(selectedChannels)
        .filter(key => selectedChannels[key])
        .join();

const getChannelsState = (channelsString: string, channelNum: number) => {
    var channelsState = Array.from(Array(channelNum).keys(), x => false);
    if (channelsString.length > 0) {
        channelsString.split(',').forEach((e: any) => (channelsState[e] = true));
    }
    return channelsState;
};

function AudioPlayerDisplay({
    currentStream,
    pcapID,
    cursorInitPos,
    onChange,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
    cursorInitPos: number;
    onChange: (c: number, d: number) => void | undefined;
}) {
    const audio_media_information = currentStream?.media_specific as SDK.api.pcap.IST2110AudioInfo;
    const channelsNum = audio_media_information.number_channels;
    const channelsArray = Array.from(Array(channelsNum).keys(), x => true); //select all boxs

    const [selectedChannels, setSelectedChannels] = React.useState<boolean[]>(channelsArray);

    const [mp3Url, setMp3Url] = React.useState<string>();
    React.useEffect(() => {
        const loadMp3Url = async (): Promise<void> => {
            const newMp3Url = await list.stream.downloadMp3Url(pcapID, currentStream?.id);
            setMp3Url(newMp3Url);
        };
        loadMp3Url();
    }, [currentStream?.id]);

    const wsClient = list.wsClient;

    React.useEffect(() => {
        if (wsClient === (null || undefined)) {
            return;
        }
        const handleMessage = (msg: any) => {
            if (msg.event === eventsAudioPlayer.Mp3Complete) {
                const { channels } = msg.data;
                const newMp3Url = list.stream.downloadMp3Url(pcapID, currentStream?.id, channels);
                setMp3Url(newMp3Url);
                setSelectedChannels(getChannelsState(channels, channelsNum));
            } else if (msg.event === eventsAudioPlayer.Mp3Failed) {
                setMp3Url('');
            }
        };

        wsClient.on('message', handleMessage);

        return () => {
            wsClient.off('message', handleMessage);
        };
    }, [wsClient]);

    const onRenderMp3 = () => {
        list.stream
            .renderMp3(pcapID, currentStream?.id, getChannelsString(selectedChannels))
            .then(() => {})
            .catch((error: any) => {
                const errorMessage = error.response.data.message || '';
                console.log(errorMessage);
            });
    };

    const audioPlayerRender = translate('audio_player.render');

    if (mp3Url === undefined) {
        return null;
    }
    return (
        <div className="audio-player-container">
            <div className="audio-player-container-title">
                <span>Audio Player</span>
            </div>
            <div className="audio-player">
                <div>
                    {mp3Url !== '' ? (
                        <AudioPlayer mp3Url={mp3Url} cursorInitPos={cursorInitPos} onCursorChanged={onChange} />
                    ) : (
                        <div style={{ color: 'red' }}>ERROR: MP3_FILE_FAILED</div>
                    )}
                </div>
                <div className="checkbox-list-container">
                    <CheckboxListHOC
                        channelsNum={channelsNum}
                        channelsArray={selectedChannels}
                        onChangedValue={setSelectedChannels}
                    />

                    <ButtonAudioPlayer type="info" label={audioPlayerRender} outline onClick={onRenderMp3} />
                </div>
            </div>
        </div>
    );
}

export default AudioPlayerDisplay;
