import React from 'react';
import { CustomScrollbar } from 'components/index';
import PCapDetailsAnalysisPage from './AnalysisPage/PCapDetailsAnalysisPage';
import PCapDetailsHeaderHOC from './Header/PCapDetailsHeaderHOC';
import SDK from '@bisect/ebu-list-sdk';
import PcapDetailsStreamExplorerPage from './StreamExplorerPage/PcapDetailsStreamExplorerPage';
import PcapDetailsGraphsPage from './GraphsPage/PcapDetailsGraphsPage';
import './styles.scss';
function PCapDetailsContent({
    stream,
    pcapFilename,
    pcapID,
    pcap,
}: {
    stream: SDK.types.IStreamInfo | undefined;
    pcapFilename: string | undefined;
    pcapID: string;
    pcap: SDK.types.IPcapInfo | undefined;
}) {
    const [currentHeaderType, setcurrentHeaderType] = React.useState<number>(0);

    const isTTML = stream?.full_media_type === 'application/ttml+xml';
    const isUnknown = stream?.full_media_type === 'unknown';
    const isJxsv = stream?.full_media_type === 'video/jxsv';
    const isSRT = stream?.full_transport_type === 'SRT';

    //If we support more media types that don't need graphs or analysis, this needs to be changed
    const hasAnalysis = !isTTML && !isSRT;
    const hasStreamExplorer = !isUnknown && !isJxsv && !isSRT;

    React.useEffect(() => {
        if (!hasAnalysis) {
            !hasStreamExplorer ? setcurrentHeaderType(2) : setcurrentHeaderType(1);
        }
    }, [hasAnalysis]);

    const onHeaderTypeClick = (headerType: number): void => {
        setcurrentHeaderType(headerType);
    };

    const getPcapDetailsMiddleContent = () => {
        switch (currentHeaderType) {
            case 0:
                return <PCapDetailsAnalysisPage currentStream={stream} pcapID={pcapID} />;
            case 1:
                return <PcapDetailsStreamExplorerPage currentStream={stream} pcapID={pcapID} pcap={pcap} />;
            case 2:
                return <PcapDetailsGraphsPage currentStream={stream} pcapID={pcapID} />;
            default:
                return <div>ERROR, CONTENT NOT FOUND</div>;
        }
    };

    const profileName = pcap?.analysis_profile.label;

    return (
        <div>
            <div className="main-page-header">
                <PCapDetailsHeaderHOC
                    headerTitle={pcapFilename}
                    profileName={profileName}
                    onHeaderTypeClick={onHeaderTypeClick}
                    currentHeaderType={currentHeaderType}
                    hasAnalysis={hasAnalysis}
                    hasStreamExplorer={hasStreamExplorer}
                />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>{getPcapDetailsMiddleContent()}</CustomScrollbar>
            </div>
        </div>
    );
}

export default PCapDetailsContent;
