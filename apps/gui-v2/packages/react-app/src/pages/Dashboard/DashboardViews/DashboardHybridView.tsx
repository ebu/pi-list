import React from 'react';
import DashboardTilesView from './DashboardTilesView';
import { DetailsTableHOC, SearchBar } from 'components/index';
import { findOne } from '../../../utils/searchBar';
import SDK from '@bisect/ebu-list-sdk';
import _ from 'lodash';
import '../styles.scss';

interface IDetailsTableData {
    id: string;
    filename: string;
    index: number;
    compliant: boolean | undefined;
    video: number;
    ttml: number;
    audio: number;
    ancillary: number;
    unknown: number;
}

interface IPropTypes {
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    pcaps: SDK.types.IPcapInfo[];
    onRowClicked: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    onDoubleClick: (id: string) => void;
    selectedPcapIds: string[];
}
const DashboardHybridView: React.FunctionComponent<IPropTypes> = ({
    onClick,
    pcaps,
    onRowClicked,
    onDoubleClick,
    selectedPcapIds,
}: IPropTypes) => {
    const getTableData = (pcaps: SDK.types.IPcapInfo[]): IDetailsTableData[] => {
        const tableData: IDetailsTableData[] = [];
        pcaps.slice(3).forEach((item, index) => {
            const data = {
                id: item.id,
                filename: item.file_name,
                index: index + 3,
                compliant: item.summary === undefined ? undefined : item.summary.error_list.length === 0 ? true : false,
                video: item.video_streams,
                ttml: item.ttml_streams,
                audio: item.audio_streams,
                ancillary: item.anc_streams,
                unknown:
                    item.total_streams -
                    (item.video_streams + item.audio_streams + item.anc_streams + item.ttml_streams),
            };
            tableData.push(data);
        });
        return tableData;
    };

    const [filterString, setFilterString] = React.useState<string>('');
    const [filterTableData, setFilterTableData] = React.useState<any[]>(getTableData(pcaps));
    const [filterTilesData, setFilterTilesData] = React.useState<any[]>(pcaps.slice(0, 3));

    React.useEffect(() => {
        if (filterString === '') {
            setFilterTableData(getTableData(pcaps));
            setFilterTilesData(pcaps.slice(0, 3));
        } else {
            const tokens = filterString.split(/\s+/).filter(v => v !== '');

            const dataFilter = pcaps.filter(value => {
                const filenameResult = findOne(value.file_name, tokens);
                const unknownStreams =
                    value.total_streams -
                    (value.video_streams + value.audio_streams + value.anc_streams + value.ttml_streams);
                const compliant =
                    value.summary === undefined ? undefined : value.summary.error_list.length === 0 ? true : false;
                const compliantResult =
                    unknownStreams > 0
                        ? findOne('unknown', tokens)
                        : compliant === true
                        ? findOne('compliant', tokens)
                        : findOne('not', tokens) || findOne('compliant', tokens);

                return filenameResult || compliantResult;
            });
            setFilterTableData(getTableData(dataFilter));
            setFilterTilesData(dataFilter.slice(0, 3));
        }
    }, [filterString]);

    return (
        <>
            <SearchBar filterString={filterString} setFilterString={setFilterString} />
            <DashboardTilesView
                onClick={onClick}
                onDoubleClick={onDoubleClick}
                pcaps={filterTilesData}
                selectedPcapIds={selectedPcapIds}
            />
            <div className="dashboard-details-table-container">
                <div className="details-table-container">
                    {filterTableData.length === 0 ? null : (
                        <DetailsTableHOC
                            onRowClicked={onRowClicked}
                            onDoubleClick={onDoubleClick}
                            detailsTableData={filterTableData}
                            selectedPcapIds={selectedPcapIds}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default DashboardHybridView;
