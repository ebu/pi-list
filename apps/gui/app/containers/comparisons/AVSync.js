import React, { useState, useEffect, useReducer } from 'react';
import api from 'utils/api';
import asyncLoader from 'components/asyncLoader';
import VideoTimeline from 'components/stream/VideoTimeline'
import Panel from 'components/common/Panel';
import InfoPane from 'containers/streamPage/components/InfoPane';
import AudioPlayer from 'components/audio/AudioPlayer';
import websocket from 'utils/websocket';
import websocketEventsEnum from 'enums/websocketEventsEnum';
import { getVideoFromConfig, getAudioFromConfig, getVideoCursor, getAudioCursor, getAVDelay } from 'utils/AVSync.js';
import { nsPerSec, usPerSec, msPerSec } from 'utils/constants';

const AVSync = (props) => {
    const video = getVideoFromConfig(props.config);
    const audio = getAudioFromConfig(props.config);

    const [mp3Url, setMp3Url] = useState(api.downloadMp3Url(audio.pcap, audio.stream)); // with 2 channels by default
    const [videoCursor, setVideoCursor] = useState(props.result.videoCursor);
    const [audioCursor, setAudioCursor] = useState(props.result.audioCursor);
    const [delay, setDelay] = useState(props.result.delay);
    const comment = `Audio is ${delay.pkt == 0? 'in sync with' : delay.pkt < 0? 'earlier' : 'later'} than video`;

    const summary = [
        {
            labelTag: 'video_player.cursor',
            value: videoCursor.position + 1,
            units: video.scan_type === 'interlaced'? 'fields' : 'frames',
        },
        {
            labelTag: 'audio_player.cursor',
            value: (audioCursor.pktTs - audio.first_packet_ts / nsPerSec).toFixed(3),
            units: 's',
        },
        {
            labelTag: 'comparison.result.AVDelayPkt',
            value:  (delay.pkt / 1000).toFixed(3),
            units: `ms (+/-0.5 ${video.scan_type === 'interlaced'? 'fields' : 'frames'})`,
        },
        {
            labelTag: 'comparison.result.AVDelayRtp',
            value:  (delay.rtp / 1000).toFixed(3),
            units: 'ms',
        },
    ];

    const onMp3Rendered = () => setMp3Url(api.downloadMp3Url(audio.pcap, audio.stream));
    const onMp3Failed = () => setMp3Url("");

    useEffect(() => {
        websocket.on(websocketEventsEnum.MEDIA.MP3_FILE_RENDERED, onMp3Rendered);
        websocket.on(websocketEventsEnum.MEDIA.MP3_FILE_FAILED, onMp3Failed);
        return () =>  {
            websocket.off(websocketEventsEnum.MEDIA.MP3_FILE_RENDERED, onMp3Rendered);
            websocket.off(websocketEventsEnum.MEDIA.MP3_FILE_FAILED, onMp3Failed);
        }
    }, []);

    const onFrameChange = (index, frame) => {
        if (index < 0) {
            return;
        }
        getVideoCursor(frame, index, video)
        .then(e => {setVideoCursor(e);});
    }

    const onAudioCursorChanged = (mp3Duration, mp3CurrentTime) => {
        getAudioCursor(mp3Duration, mp3CurrentTime, audio)
        .then(e => {setAudioCursor(e);});
    }

    useEffect(() => {
        setDelay(getAVDelay(props, audioCursor, videoCursor, delay));
    }, [audioCursor, videoCursor]);

    return (
        <div>
            <InfoPane
                icon='alarm'
                headingTag='headings.AVSync'
                values={summary}
                comment={comment}
            />
            <Panel className="lst-stream-info-tab">
                <VideoTimeline
                    pcapID={video.pcap}
                    streamID={video.stream}
                    frames={props.frames}
                    initFrameIndex={props.result.videoCursor.position}
                    onFrameChange={onFrameChange}
                />
                <AudioPlayer
                    src={mp3Url}
                    timeline={true}
                    cursorInitPos={props.result.audioCursor.position}
                    onCursorChanged={onAudioCursorChanged}
                />
            </Panel>
        </div>
    );
    //TODO: maybe add timeline with sliders https://reactjsexample.com/a-timeline-range-slider-with-react-js/
};

export default asyncLoader(AVSync, {
    asyncRequests: {
        frames: props => {
            const video = props.config.main.media_type === 'video'? props.config.main : props.config.reference;
            return api.getFramesFromStream(video.pcap, video.stream);
        },
    }
});
