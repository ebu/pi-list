import SDK from '@bisect/ebu-list-sdk';
import AudioDashboardRtpInfo from './AudioDashboardRtpInfo';
import AudioDashboardTsdfInfo from './AudioDashboardTsdfInfo';
import '../../styles.scss';
import './styles.scss';

function AudioAnalysisDisplay({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    return (
        <>
            <div className="analysis-page-container">
                <AudioDashboardRtpInfo currentStream={currentStream} />
            </div>
            <div className="analysis-page-container">
                <AudioDashboardTsdfInfo currentStream={currentStream} />
            </div>
        </>
    );
}

export default AudioAnalysisDisplay;
