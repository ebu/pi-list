import React from 'react';
import { CustomScrollbar } from '../../components';
import CapturePanel from './CapturePanel';
import LiveSourceTable from './LiveSourceTable';
import CaptureHeaderHOC from './Header/CaptureHeaderHOC';
import { useRecoilValue } from 'recoil';
import useRecoilLiveSourceHandler from '../../store/gui/liveSource/useRecoilLiveSourceHandler';
import { liveSourceAtom } from '../../store/gui/liveSource/liveSource';
import './styles.scss';

interface IComponentProps {
    onCapture: (name: string, duration: number, source: string) => void;
}

function CaptureContent({
    onCapture
}: IComponentProps) {

    useRecoilLiveSourceHandler();
    const liveSourceTableData = useRecoilValue(liveSourceAtom);
    const [selectedLiveSourcesIds, setSelectedLiveSourcesIds] = React.useState<string[]>([]);

    return (
        <>
            <div className="main-page-header">
                <CaptureHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <CapturePanel
                        onCapture={onCapture}
                    />
                    <LiveSourceTable
                        liveSourceTableData={liveSourceTableData}
                        selectedLiveSourcesIds={selectedLiveSourcesIds}
                    />
                </CustomScrollbar>
            </div>
        </>
    );
}

export default CaptureContent;
