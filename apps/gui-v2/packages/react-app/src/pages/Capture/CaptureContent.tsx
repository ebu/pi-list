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
    onCapture: (name: string, duration: number, sources: string[]) => void;
}

function CaptureContent({
    onCapture
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

    const onLocalCapture = (name: string, duration: number) => {
        onCapture(name, duration, selectedLiveSourceIds);
    }

    return (
        <>
            <div className="main-page-header">
                <CaptureHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <CapturePanel
                        onCapture={onLocalCapture}
                    />
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
