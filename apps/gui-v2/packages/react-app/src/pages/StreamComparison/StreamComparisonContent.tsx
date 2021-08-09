import React from 'react';
import StreamComparisonHeaderHOC from './Header/StreamComparisonHeaderHOC';
import StreamComparisonPanel from './StreamComparisonPanel';
import './styles.scss';
import { streamComparisonAtom } from '../../store/gui/streamComparison/streamComparison';
import StreamComparisonTable from './StreamComparisonTable';
import { CustomScrollbar } from '../../components';
import { useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import list from '../../utils/api';

function StreamComparisonContent({
    pcaps,
    onIconsClick,
    selectedWorkflow,
    onSelectedComparisonClick,
    selectedComparison,
}: any) {
    const history = useHistory();
    const comparisonTableData = useRecoilValue(streamComparisonAtom);

    const [currentComparisonsIds, setCurrentComparisonsIds] = React.useState<string[]>([]);

    const onTableRowClick = (item: any, e: React.MouseEvent<HTMLElement>) => {
        if (e.ctrlKey) {
            if (currentComparisonsIds.includes(item.id)) {
                setCurrentComparisonsIds(currentComparisonsIds.filter(i => i !== item.id));
            } else {
                setCurrentComparisonsIds([...currentComparisonsIds, item.id]);
            }
        } else {
            setCurrentComparisonsIds([item.id]);
        }
    };

    const onTableRowDoubleClick = (item: any) => {
        history.push(`/streamComparison/${item.id}`);
    };

    const onDeleteComparisons = async () => {
        currentComparisonsIds.forEach(async (comparisonId: string) => {
            await list.streamComparison.delete(comparisonId);
        });
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
                    <button
                        className="stream-comparison-panel-compare-button button-padding"
                        onClick={() => onDeleteComparisons()}
                    >
                        Delete selected comparisons
                    </button>
                    <StreamComparisonTable
                        comparisonTableData={comparisonTableData}
                        onTableRowClick={onTableRowClick}
                        onTableRowDoubleClick={onTableRowDoubleClick}
                        selectedComparisonsIds={currentComparisonsIds}
                    />
                </CustomScrollbar>
            </div>
        </div>
    );
}

export default StreamComparisonContent;
