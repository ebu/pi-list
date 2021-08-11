import {
    getVideoFromConfig,
    getAudioFromConfig,
    getPcapIdVideoFromConfig,
    getPcapIdAudioFromConfig,
} from './utils/AVSyncUtils';
import AudioStreamExplorerDisplay from '../../../PCapDetails/StreamExplorerPage/Audio/AudioStreamExplorerDisplay';
import ImageGalleryStreamExplorer from '../../../PCapDetails/StreamExplorerPage/Video/ImageGalleryStreamExplorer';

function AVSyncView({ comparisonInfo, mainStreamInfo, referenceStreamInfo }: any) {
    const video = getVideoFromConfig(comparisonInfo.config, mainStreamInfo, referenceStreamInfo);
    const audio = getAudioFromConfig(comparisonInfo.config, mainStreamInfo, referenceStreamInfo);
    const videoPcapId = getPcapIdVideoFromConfig(comparisonInfo.config);
    const audioPcapId = getPcapIdAudioFromConfig(comparisonInfo.config);

    const comment = `Audio is ${
        comparisonInfo.result.delay.pkt == 0
            ? 'in sync with'
            : comparisonInfo.result.delay.pkt < 0
            ? 'earlier'
            : 'later'
    } than video`;

    return (
        <div>
            <span className="comparison-configuration-panel-title padding-to-title">Audio-Video Synchronization</span>
            <div className="st20227-data-container">
                <span className="comparison-configuration-panel-data">{comment}</span>
                <div>
                    <span className="comparison-configuration-panel-subtitle">Video Cursor: </span>
                    <span className="comparison-configuration-panel-data">{`${comparisonInfo.result.videoCursor
                        .position + 1}`}</span>
                    <span className="comparison-configuration-panel-data">
                        {' '}
                        {video.scan_type === 'interlaced' ? 'fields' : 'frames'}
                    </span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">Audio Cursor: </span>
                    <span className="comparison-configuration-panel-data">{`${(
                        comparisonInfo.result.audioCursor.pktTs -
                        audio.first_packet_ts / 1000000000
                    ).toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data"> s</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">A/V delay (Pkt time): </span>
                    <span className="comparison-configuration-panel-data">{`${(
                        comparisonInfo.result.delay.pkt / 1000
                    ).toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data">
                        {' '}
                        {`ms (+/-0.5 ${video.scan_type === 'interlaced' ? 'fields' : 'frames'})`}
                    </span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">A/V delay (RTP time): </span>
                    <span className="comparison-configuration-panel-data">{`${(
                        comparisonInfo.result.delay.rtp / 1000
                    ).toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data"> ms</span>
                </div>
            </div>
            <div>
                <ImageGalleryStreamExplorer currentStream={video} pcapID={videoPcapId} />
                <AudioStreamExplorerDisplay currentStream={audio} pcapID={audioPcapId} />
            </div>
        </div>
    );
}

export default AVSyncView;
