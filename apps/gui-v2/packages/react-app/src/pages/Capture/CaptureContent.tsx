import React from 'react';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { CustomScrollbar } from '../../components';
import CapturePanel from './CapturePanel';
import LiveSourceTable from './LiveSourceTable';
import CaptureHeaderHOC from './Header/CaptureHeaderHOC';
import { useRecoilValue } from 'recoil';
import useRecoilLiveSourceHandler from '../../store/gui/liveSource/useRecoilLiveSourceHandler';
import { liveSourceAtom } from '../../store/gui/liveSource/liveSource';
import { pcapsAnalysingAtom } from '../../store/gui/pcaps/pcapsAnalysing';
import { pcapsAtom } from '../../store/gui/pcaps/pcaps';
import { pcapCapturingToTile, pcapAnalysingToTile, pcapToTile } from 'pages/Common/DashboardTileHOC';
import './styles.scss';

interface IComponentProps {
    onTileDoubleClick: (id: string) => void;
}

function CaptureContent({
    onTileDoubleClick,
}: IComponentProps) {

    useRecoilLiveSourceHandler();
    const liveSourceTableData = useRecoilValue(liveSourceAtom);
    const [selectedLiveSourceIds, setSelectedLiveSourceIds] = React.useState<string[]>([]);

    const onRowClick = (item: any, e: React.MouseEvent<HTMLElement>) => {
        if (e.ctrlKey) {
            if (selectedLiveSourceIds.includes(item.id)) {
                setSelectedLiveSourceIds(selectedLiveSourceIds.filter(i => i !== item.id));
            } else {
                setSelectedLiveSourceIds([...selectedLiveSourceIds, item.id]);
            }
        } else {
            setSelectedLiveSourceIds([item.id]);
        }
    };

    const [filename, setFilename] = React.useState<string>('');
    const [captureProgress, setCaptureProgress] = React.useState<number>(0);
    const msPeriod: number = 200;

    function tick(msCounter: number, durationMs: number) {
        const newMsCounter = msCounter + msPeriod;
        if (newMsCounter < durationMs) {
            setCaptureProgress(newMsCounter/durationMs*100);
            setTimeout(tick, msPeriod, newMsCounter, durationMs);
        } else {
            setCaptureProgress(0);
        }
    }

    const onCapture = async (name: string, duration: number) => {
        const datetime: string = new Date().toLocaleString().split(" ").join("-").split("/").join("-");
        const newFilename: string = `${name}-${datetime}`;
        setFilename(newFilename);
        setCaptureProgress(0);
        console.log(`Capturing ${newFilename}`)
        await list.live.startCapture(newFilename, duration, selectedLiveSourceIds);
        const captureResult = await list.live.makeCaptureAwaiter(newFilename, duration);
        if (!captureResult) {
            console.error('Pcap capture and processing failed');
            // todo show notif
            return;
        }
        setTimeout(tick, msPeriod, 0, duration);
    };

    const pcapsFinished = useRecoilValue(pcapsAtom);
    const pcapsAnalysing = useRecoilValue(pcapsAnalysingAtom);

    return ( <>
            <div className="main-page-header">
                <CaptureHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <div className="capture-content-row">
                        <CapturePanel
                            onCapture={onCapture}
                        />
                        {
                            (captureProgress > 0) ?
                                pcapCapturingToTile(filename, captureProgress) :
                                pcapsAnalysing
                                .filter((pcap: SDK.types.IPcapFileReceived) => pcap.file_name !== undefined && pcap.file_name === filename)
                                .map((pcap: SDK.types.IPcapFileReceived, index: number) => pcapAnalysingToTile(pcap))
                        }
                        {
                            pcapsFinished
                            .filter((pcap: SDK.types.IPcapInfo) => pcap.file_name !== undefined && pcap.file_name === filename)
                            .map((pcap: SDK.types.IPcapInfo, index: number) => pcapToTile(onTileDoubleClick, ()=>{}, pcap, 0, []))
                        }
                    </div>

                    <LiveSourceTable
                        liveSourceTableData={liveSourceTableData}
                        onRowClick={onRowClick}
                        selectedLiveSourceIds={selectedLiveSourceIds}
                    />
                </CustomScrollbar>
            </div>
        </>
    );
}

export default CaptureContent;
