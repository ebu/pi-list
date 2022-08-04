import SDK from '@bisect/ebu-list-sdk';
import Dashboard21Info from './Dashboard21Info';
import DashboardRtpInfo from './DashboardRtpInfo';
import '../../styles.scss';
import './styles.scss';

function VideoAnalysisDisplay({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    return (
        <>
            <div className="analysis-page-container">
                <Dashboard21Info currentStream={currentStream} />
            </div>
            <div className="analysis-page-container">
                <DashboardRtpInfo currentStream={currentStream} />
            </div>
        </>
    );
}

export default VideoAnalysisDisplay;
