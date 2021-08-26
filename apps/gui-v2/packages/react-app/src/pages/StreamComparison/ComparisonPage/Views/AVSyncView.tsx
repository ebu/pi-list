import React from 'react';
import {
    getVideoFromConfig,
    getAudioFromConfig,
    getPcapIdVideoFromConfig,
    getPcapIdAudioFromConfig,
    getVideoCursor,
    getAudioCursor,
    getAVDelay,
} from './utils/AVSyncUtils';
import AudioPlayerDisplay from '../../../PCapDetails/StreamExplorerPage/Audio/AudioPlayerDisplay';
import ImageGalleryStreamExplorer from '../../../PCapDetails/StreamExplorerPage/Video/ImageGalleryStreamExplorer';

function AVSyncView({ comparisonInfo, mainStreamInfo, referenceStreamInfo }: any) {
    const video = getVideoFromConfig(comparisonInfo.config, mainStreamInfo, referenceStreamInfo);
    const audio = getAudioFromConfig(comparisonInfo.config, mainStreamInfo, referenceStreamInfo);
    const videoPcapId = getPcapIdVideoFromConfig(comparisonInfo.config);
    const audioPcapId = getPcapIdAudioFromConfig(comparisonInfo.config);

    const [videoCursor, setVideoCursor] = React.useState<any>(comparisonInfo.result.videoCursor);
    const [audioCursor, setAudioCursor] = React.useState<any>(comparisonInfo.result.audioCursor);
    const [delay, setDelay] = React.useState<any>(comparisonInfo.result.delay);

    const comment = `Audio is ${
        comparisonInfo.result.delay.pkt == 0
            ? 'in sync with'
            : comparisonInfo.result.delay.pkt < 0
            ? 'earlier'
            : 'later'
    } than video`;

    const onVideoChange = (frame: any, index : number) => {
        getVideoCursor(frame, index, video)
        .then(e => {setVideoCursor(e);});
    }

    const onAudioChange = (mp3Duration: number, mp3CurrentTime: number) => {
        getAudioCursor(mp3Duration, mp3CurrentTime, audio)
        .then(e => {setAudioCursor(e);});
    }

    React.useEffect(() => {
        setDelay(getAVDelay(comparisonInfo, audioCursor, videoCursor, delay));
    }, [audioCursor, videoCursor]);

    return (
        <div>
            <span className="comparison-configuration-panel-title padding-to-title">Audio-Video Synchronization</span>
            <div className="st20227-data-container">
                <span className="comparison-configuration-panel-data">{comment}</span>
                { // uncomment for troubleshootin
                /*
                <div>
                    <span className="comparison-configuration-panel-subtitle">Video Cursor: </span>
                    <span className="comparison-configuration-panel-data">
                        {`${videoCursor.position + 1}`}
                    </span>
                    <span className="comparison-configuration-panel-data">
                        {' '}
                        {video.media_specific.scan_type === 'interlaced' ? 'fields' : 'frames'}
                    </span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">Audio Cursor: </span>
                    <span className="comparison-configuration-panel-data">
                        {`${(audioCursor.pktTs - audio.statistics.first_packet_ts / 1000000000).toFixed(3)}`}
                    </span>
                    <span className="comparison-configuration-panel-data"> s</span>
                </div>
                */ }
                <div>
                    <span className="comparison-configuration-panel-subtitle">A/V delay (Pkt time): </span>
                    <span className="comparison-configuration-panel-data">
                        {`${(delay.pkt / 1000).toFixed(3)}`}
                    </span>
                    <span className="comparison-configuration-panel-data">
                        {' '}
                        {`ms (+/-0.5 ${video.media_specific.scan_type === 'interlaced' ? 'field' : 'frame'})`}
                    </span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">A/V delay (RTP time): </span>
                    <span className="comparison-configuration-panel-data">
                        {`${( delay.rtp / 1000).toFixed(3)}`}
                    </span>
                    <span className="comparison-configuration-panel-data"> ms</span>
                </div>
            </div>
            <div>
                <ImageGalleryStreamExplorer currentStream={video} pcapID={videoPcapId} cursorInitPos={comparisonInfo.result.videoCursor.position} onChange={onVideoChange}/>
                <AudioPlayerDisplay currentStream={audio} pcapID={audioPcapId} cursorInitPos={comparisonInfo.result.audioCursor.position} onChange={onAudioChange}/>
            </div>
        </div>
    );
}

export default AVSyncView;
