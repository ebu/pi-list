import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import StreamComparisonHeaderHOC from './Header/StreamComparisonHeaderHOC';
import StreamComparisonPanel from './StreamComparisonPanel';
import './styles.scss';
import { streamComparisonAtom } from '../../store/gui/streamComparison/streamComparison';
import useRecoilStreamComparisonHandler from '../../store/gui/streamComparison/useRecoilStreamComparisonHandler';
import StreamComparisonTable from './StreamComparisonTable';
import { CustomScrollbar } from '../../components';
import { useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';

interface IPropTypes {
    pcaps: SDK.types.IPcapInfo[];
    onIconsClick: (type: string) => void;
    selectedWorkflow: string;
    onSelectedComparisonClick: (type: string) => void;
    selectedComparison: string;
    onTableRowClick: (item: any, e: React.MouseEvent<HTMLElement>) => void;
    selectedComparisonsIds: string[];
}

function StreamComparisonContent({
    pcaps,
    onIconsClick,
    selectedWorkflow,
    onSelectedComparisonClick,
    selectedComparison,
    onTableRowClick,
    selectedComparisonsIds,
}: IPropTypes) {
    const history = useHistory();

    useRecoilStreamComparisonHandler();

    const comparisonTableData = useRecoilValue(streamComparisonAtom);

    const onTableRowDoubleClick = (item: any) => {
        history.push(`/streamComparison/${item.id}`);
    };

    return (
        <div>
            <div className="main-page-header">
                <StreamComparisonHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <StreamComparisonPanel
                        pcaps={pcaps}
                        onIconsClick={onIconsClick}
                        selectedWorkflow={selectedWorkflow}
                        onSelectedComparisonClick={onSelectedComparisonClick}
                        selectedComparison={selectedComparison}
                    />
                    {/* <button
                        className="stream-comparison-panel-compare-button button-padding"
                        onClick={() => onDeleteComparisons()}
                    >
                        Delete selected comparisons
                    </button> */}
                    <StreamComparisonTable
                        comparisonTableData={comparisonTableData}
                        onTableRowClick={onTableRowClick}
                        onTableRowDoubleClick={onTableRowDoubleClick}
                        selectedComparisonsIds={selectedComparisonsIds}
                    />
                </CustomScrollbar>
            </div>
        </div>
    );
}

export default StreamComparisonContent;
