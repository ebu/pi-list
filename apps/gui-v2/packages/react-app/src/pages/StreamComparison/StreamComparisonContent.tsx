import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import StreamComparisonHeaderHOC from './Header/StreamComparisonHeaderHOC';
import StreamComparisonPanel from './StreamComparisonPanel';
import './styles.scss';
import { streamComparisonAtom } from '../../store/gui/streamComparison/streamComparison';
import useRecoilStreamComparisonHandler from '../../store/gui/streamComparison/useRecoilStreamComparisonHandler';
import StreamComparisonTable from './StreamComparisonTable';
import { CustomScrollbar, SearchBar } from '../../components';
import { useRecoilValue } from 'recoil';
import { useHistory } from 'react-router-dom';
import { findOne } from '../../utils/searchBar';
import { getComparisonType } from '../../utils/titles';
import routeBuilder from '../../routes/routeBuilder';

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
        const route = routeBuilder.stream_comparison_list(item.id);
        history.push(route);
    };

    const [filterString, setFilterString] = React.useState<string>('');
    const [filterTableData, setFilterTableData] = React.useState<any[]>(comparisonTableData);

    React.useEffect(() => {
        if (filterString === '') {
            setFilterTableData(comparisonTableData);
        } else {
            const tokens = filterString.split(/\s+/).filter(v => v !== '');
            const dataFilter = comparisonTableData.filter(value => {
                const filenameResult = findOne(value.name, tokens);
                const typeResult = findOne(getComparisonType(value.type), tokens);

                return filenameResult || typeResult;
            });
            setFilterTableData(dataFilter);
        }
    }, [filterString, comparisonTableData]);

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
                    <div className="dashboard-search-bar-container">
                        <SearchBar filterString={filterString} setFilterString={setFilterString} />
                    </div>
                    <StreamComparisonTable
                        comparisonTableData={filterTableData}
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
