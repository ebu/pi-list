import React, { Fragment, useState, useEffect } from 'react';
import _ from 'lodash';
import api from '../../utils/api';
import Button from '../../components/common/Button';
import SectionHeader from '../../components/common/SectionHeader';
import AudioPlayer from '../../components/audio/AudioPlayer';
import { translateC } from '../../utils/translation';
import websocketEventsEnum from '../../enums/websocketEventsEnum';
import websocket from '../../utils/websocket';
import CheckboxList from './CheckboxList';
import notifications from '../../utils/notifications';

const getChannelsString = (selectedChannels) => Object.keys(selectedChannels).filter(key => selectedChannels[key]).join();

const getChannelsState = (channelsString, channelNum) => {
    var channelsState = Array.from([...Array(channelNum).keys()], x => false);
    if (channelsString.length > 0) {
        channelsString.split(',').forEach((e) => channelsState[e] = true );
    }
    return channelsState;
}

const AudioExplorer = (props) => {
    const [selectedChannels, setSelectedChannels] = useState(Array.from([...Array(props.channelNum).keys()], x => true)); // select all
    const [mp3Url, setMp3Url] = useState(api.downloadMp3Url(props.pcapID, props.streamID));

    const onMp3Rendered = (data) => {
        const { channels } = data;
        setMp3Url(api.downloadMp3Url(props.pcapID, props.streamID, channels));
        setSelectedChannels(getChannelsState(channels, props.channelNum));
    };

    const onMp3Failed = () => {
        setMp3Url("");
    };

    useEffect(() => {
        websocket.on(websocketEventsEnum.MEDIA.MP3_FILE_RENDERED, onMp3Rendered);
        websocket.on(websocketEventsEnum.MEDIA.MP3_FILE_FAILED, onMp3Failed);
        return () =>  {
            websocket.off(websocketEventsEnum.MEDIA.MP3_FILE_RENDERED, onMp3Rendered);
            websocket.off(websocketEventsEnum.MEDIA.MP3_FILE_FAILED, onMp3Failed);
        }
    }, []);

    const onRenderMp3 = () => {
        api.renderMp3(props.pcapID, props.streamID, getChannelsString(selectedChannels))
            .then(() => { })
            .catch((error) => {
                const errorMessage = _.get(error, ['response', 'data', 'message'], '');
                notifications.error({
                    title: translate('notifications.error.mp3_render'),
                    message: errorMessage
                });
            });
    };

    return (
        <Fragment>
            <SectionHeader label={translateC('headings.audio_explorer')} icon='headset' />
            <div className='row'>
                <div className='col-xs-12 col-md-1'>
                    <div className='lst-stream-info-label col-xs-1'>
                        <span>Channels:</span>
                    </div>
                    <div className='lst-text-center'>
                        <CheckboxList onChange={setSelectedChannels} values={selectedChannels}/>
                    </div>
                    <Button type='info' label={translateC('audio_player.render')} outline onClick={onRenderMp3} />
                </div>
                <div className='col-xs-12 col-md-10'>
                    <AudioPlayer src={mp3Url} />
                </div>
            </div>
        </Fragment>
    );
};

export default AudioExplorer;
