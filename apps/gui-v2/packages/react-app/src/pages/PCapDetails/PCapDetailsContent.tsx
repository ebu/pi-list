import React from 'react';
import { CustomScrollbar } from 'components/index';
import PCapDetailsAnalysisPage from './AnalysisPage/PCapDetailsAnalysisPage';
import PCapDetailsHeaderHOC from './Header/PCapDetailsHeaderHOC';
import SDK from '@bisect/ebu-list-sdk';
import PcapDetailsStreamExplorerPage from './StreamExplorerPage/PcapDetailsStreamExplorerPage';
import PcapDetailsGraphsPage from './GraphsPage/PcapDetailsGraphsPage';
import './styles.scss';
function PCapDetailsContent({
    currentStream,
    pcapFilename,
    pcapID,
    pcap,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapFilename: string | undefined;
    pcapID: string;
    pcap: SDK.types.IPcapInfo | undefined;
}) {
    const [currentHeaderType, setcurrentHeaderType] = React.useState<number>(0);

    const isTTML = currentStream?.media_type === 'ttml' ? true : false;
    const isUnknown = currentStream?.media_type === 'unknown' ? true : false;

    //If we support more media types that don't need graphs or analysis, this needs to be changed
    const hasGraps = !isTTML;
    const hasAnalysis = !isTTML;
    const hasStreamExplorer = !isUnknown;

    React.useEffect(() => {
        if (!hasAnalysis) {
            setcurrentHeaderType(1);
        }
    }, [hasAnalysis]);

    const onHeaderTypeClick = (headerType: number): void => {
        setcurrentHeaderType(headerType);
    };

    const getPcapDetailsMiddleContent = () => {
        switch (currentHeaderType) {
            case 0:
                return <PCapDetailsAnalysisPage currentStream={currentStream} pcapID={pcapID} />;
            case 1:
                return <PcapDetailsStreamExplorerPage currentStream={currentStream} pcapID={pcapID} pcap={pcap} />;
            case 2:
                return <PcapDetailsGraphsPage currentStream={currentStream} pcapID={pcapID} />;
            default:
                return <div>ERROR, CONTENT NOT FOUND</div>;
        }
    };

    return (
        <div>
            <div className="main-page-header">
                <PCapDetailsHeaderHOC
                    headerTitle={pcapFilename}
                    onHeaderTypeClick={onHeaderTypeClick}
                    currentHeaderType={currentHeaderType}
                    hasGraphs={hasGraps}
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
