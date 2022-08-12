import SDK from '@bisect/ebu-list-sdk';
import Dashboard21Info from './Dashboard21Info';
import DashboardRtpInfo from './DashboardRtpInfo';
import '../../styles.scss';
import './styles.scss';

function VideoAnalysisDisplay({ stream }: { stream: SDK.types.IStreamInfo }) {
    if (!stream) return null;

    return (
        <>
            <div className="analysis-page-container">
                <Dashboard21Info stream={stream} />
            </div>
            <div className="analysis-page-container">
                <DashboardRtpInfo currentStream={stream} />
            </div>
        </>
    );
}

export default VideoAnalysisDisplay;
