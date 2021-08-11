import React from 'react';
import { IRowItem, IRowPcapAnalysingItem } from './DetailsTable';
import { DetailsTable } from '../index';

function DetailsTableHOC({
    detailsTableData,
    onRowClicked,
    onDoubleClick,
    selectedPcapIds,
    detailsPcapsAnalysingData,
}: {
    detailsTableData: IRowItem[];
    onRowClicked: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    onDoubleClick: (id: string) => void;
    selectedPcapIds: string[];
    detailsPcapsAnalysingData?: IRowPcapAnalysingItem[];
}) {
    const localOnRowClicked = (id: string, e: React.MouseEvent<HTMLElement>) => {
        onRowClicked(id, e);
    };

    return (
        <>
            <DetailsTable
                detailsTableData={detailsTableData}
                onRowClicked={localOnRowClicked}
                selectedPcapIds={selectedPcapIds}
                onDoubleClick={onDoubleClick}
                detailsPcapsAnalysingData={detailsPcapsAnalysingData}
            />
        </>
    );
}

export default DetailsTableHOC;
