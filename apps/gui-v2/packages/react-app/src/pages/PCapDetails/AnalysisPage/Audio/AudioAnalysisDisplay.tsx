import SDK from '@bisect/ebu-list-sdk';
import AudioDashboardRtpInfo from './AudioDashboardRtpInfo';
import AudioDashboardTsdInfo from './AudioDashboardTsdInfo';
import '../../styles.scss';

function AudioAnalysisDisplay({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    return (
        <>
            <div className="analysis-page-container">
                <AudioDashboardRtpInfo currentStream={currentStream} />
            </div>
            <div className="analysis-page-container">
                <AudioDashboardTsdInfo currentStream={currentStream} />
            </div>
        </>
    );
}

export default AudioAnalysisDisplay;
