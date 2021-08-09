import React from 'react';
import Header, { ICategory } from './Header';
import { translate } from '../../utils/translation';

function HeaderHOC({
    pcapsCount,
    dropdownMenu,
}: {
    pcapsCount: { totalPcaps: number; notCompliantStreams: number; compliantStreams: number };
    dropdownMenu: boolean;
}) {
    const title = 'Dashboard';

    const [currentFilterType, setCurrentHeaderFilter] = React.useState<number>(0);

    const onHeaderFilterClick = (filterType: number): void => {
        setCurrentHeaderFilter(filterType);
    };

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
        clicked: currentFilterType === item.key,
    }));

    return (
        <div>
            <Header
                headerTitle={title}
                state={categories}
                onLocalHeaderClick={onHeaderFilterClick}
                dropdownMenu={dropdownMenu}
            />
        </div>
    );
}

export default HeaderHOC;
