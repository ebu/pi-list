import React from 'react';
import { Header, ICategory } from 'components/index';
import { translate } from '../../../utils/translation';

function PCapDetailsHeaderHOC({
    headerTitle,
    onHeaderTypeClick,
    currentHeaderType,
    hasAnalysis,
    hasGraphs,
}: {
    headerTitle: string | undefined;
    onHeaderTypeClick: (headerType: number) => void;
    currentHeaderType: number;
    hasAnalysis?: boolean;
    hasGraphs?: boolean;
}) {
    let categoriesList: ICategory[] = [
        {
            name: translate('media_information.analysis'),
            key: 0,
            clicked: false,
        },
        {
            name: 'Stream Explorer',
            key: 1,
            clicked: false,
        },
        {
            name: 'Graphs',
            key: 2,
            clicked: false,
        },
    ];
    if (!hasGraphs) {
        categoriesList = categoriesList.filter(function(item) {
            return item.key !== 2;
        });
    }

    if (!hasAnalysis) {
        categoriesList = categoriesList.filter(function(item) {
            return item.key !== 0;
        });
    }

    const categories = categoriesList.map(item => ({
        name: item.name,
        count: item.count,
        key: item.key,
        clicked: currentHeaderType === item.key,
    }));

    return (
        <Header
            headerTitle={headerTitle}
            state={categories}
            onLocalHeaderClick={onHeaderTypeClick}
            dropdownMenu={false}
        />
    );
}

export default PCapDetailsHeaderHOC;
