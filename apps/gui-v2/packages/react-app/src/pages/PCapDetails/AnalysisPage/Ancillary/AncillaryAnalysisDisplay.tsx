import SDK from '@bisect/ebu-list-sdk';
import AncillaryDashboardSubStreamsInfo from './AncillaryDashboardSubStreamsInfo';
import AncillaryDashboardRtpInfo from './AncillaryDashboardRtpInfo';
import '../../styles.scss';

function AncillaryAnalysisDisplay({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    return (
        <>
            <div className="analysis-page-container">
                <AncillaryDashboardRtpInfo currentStream={currentStream} />
            </div>
            <div className="analysis-page-container">
                <AncillaryDashboardSubStreamsInfo currentStream={currentStream} />
            </div>
        </>
    );
}

export default AncillaryAnalysisDisplay;
