import React from 'react';
import { Header, ICategory } from 'components/index';
// import { translate as tr } from '@ebu-list/translations';
import { translate } from '../../../utils/translation';

function DashboardHeaderHOC({
    onHeaderFilterClick,
    pcapsCount,
    currentSelection,
}: {
    onHeaderFilterClick: (filterType: number) => void;
    pcapsCount: { totalPcaps: number; notCompliantStreams: number; compliantStreams: number };
    currentSelection: number;
}) {
    const title = 'Dashboard';
    const categoriesList: ICategory[] = [
        {
            name: 'All',
            count: pcapsCount.totalPcaps,
            key: 0,
            clicked: false,
        },
        {
            name: translate('pcap.state.compliant'),
            count: pcapsCount.compliantStreams,
            key: 1,
            clicked: false,
        },
        {
            name: translate('pcap.state.not_compliant'),
            count: pcapsCount.notCompliantStreams,
            key: 2,
            clicked: false,
        },
    ];

    const categories = categoriesList.map(item => ({
        name: item.name,
        count: item.count,
        key: item.key,
        clicked: currentSelection === item.key,
    }));

    return (
        <div>
            <Header
                headerTitle={title}
                state={categories}
                onLocalHeaderClick={onHeaderFilterClick}
                dropdownMenu={true}
            />
        </div>
    );
}

export default DashboardHeaderHOC;
