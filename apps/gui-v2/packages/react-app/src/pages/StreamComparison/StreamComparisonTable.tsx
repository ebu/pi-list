import SDK from '@bisect/ebu-list-sdk';
import { DateTime } from 'luxon';
import { CustomScrollbar } from '../../components';
import { getMediaTypeIcon, getComparisonType } from '../../utils/titles';
import './styles.scss';

export const comparisonTypes = {
    crossCorrelation: 'crossCorrelation',
    psnrAndDelay: 'psnrAndDelay',
    avSync: 'AVSync',
};

interface IPropTypes {
    comparisonTableData: any[];
    onTableRowClick: (item: any, e: React.MouseEvent<HTMLElement>) => void;
    onTableRowDoubleClick: (item: any) => void;
    selectedComparisonsIds: string[];
}

function StreamComparisonTable({
    comparisonTableData,
    onTableRowClick,
    onTableRowDoubleClick,
    selectedComparisonsIds,
}: IPropTypes) {
    const renderDelay = (value: number) => {
        return (value / 1000).toFixed(3);
    };

    const renderDate = (value: any) => {
        if (!value) return;
        return DateTime.fromMillis(value).toFormat('yyyy-MM-dd HH:mm:ss');
    };

    const getResultData = (item: any) => {
        if (item.type === 'st2022_7_analysis') {
            const intersection = item.result.analysis.intersectionSizeInPackets;
            const numberOfEqualPackets =
                intersection -
                item.result.analysis.numberOfDifferentPackets -
                item.result.analysis.numberOfMissingPackets;
            const equalPercentage = intersection == 0 ? 100 : (numberOfEqualPackets / intersection) * 100;
            return `packets: ${equalPercentage}% the same
            max delay: ${item.result.analysis.maxDeltaNs.toFixed(0) / 1000} us`;
        }
        switch (item.config.comparison_type) {
            case comparisonTypes.crossCorrelation:
            case comparisonTypes.psnrAndDelay:
                return `delay: ${item.result?.delay ? renderDelay(item.result.delay.actual).toString() : '-'} ms
                media: ${item.result?.transparency ? 'preserved' : 'modified'}`;
            case comparisonTypes.avSync:
                return `delay: ${item.result?.delay ? renderDelay(item.result.delay.pkt).toString() : '-'} ms
                audio is ${item.result.delay.actual < 0 ? 'earlier' : 'later'} than video`;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <div className="download-manager-container">
                        <div className="stream-comparison-table-container">
                            <table className="stream-comparison-table">
                                <thead>
                                    <tr className="download-manager-table-header-table-row">
                                        <th>Name</th>
                                        <th className="download-manager-table-centered-header-label">Type</th>
                                        <th className="download-manager-table-centered-header-label">
                                            Reference Stream
                                        </th>
                                        <th className="download-manager-table-centered-header-label">Main Stream</th>
                                        <th className="download-manager-table-centered-header-label">Result</th>
                                        <th className="download-manager-table-centered-header-label">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparisonTableData.map((item: any) => {
                                        const isActive = selectedComparisonsIds.includes(item.id);
                                        return (
                                            <tr
                                                className={isActive ? 'details-table-row active' : 'details-table-row'}
                                                key={item.id}
                                                onDoubleClick={() => onTableRowDoubleClick(item)}
                                                onClick={(e: any) => onTableRowClick(item, e)}
                                            >
                                                <td className="download-manager-name-data-container">
                                                    <span className="download-table-label">{item.name}</span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">
                                                        {getComparisonType(item.type)}
                                                    </span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">
                                                        {getMediaTypeIcon(item.config?.reference?.media_type)}
                                                    </span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">
                                                        {getMediaTypeIcon(item.config?.main?.media_type)}
                                                    </span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">{getResultData(item)}</span>
                                                </td>
                                                <td className="download-manager-centered-value">
                                                    <span className="download-table-label">
                                                        {renderDate(item.date)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CustomScrollbar>
            </div>
        </>
    );
}

export default StreamComparisonTable;
