import SDK from '@bisect/ebu-list-sdk';
import { ExtraPanelInformation } from 'components';
import { rangeToContentArray } from 'utils/measurements';

const MinMaxAvgRangeAdditionalInformation = ({
    title,
    definition,
    limit,
}: {
    title: string;
    definition?: string | React.ReactElement;
    limit?: SDK.api.pcap.IMinMaxAvgUsRanges;
}) => {
    const extraPanelData = {
        title: 'Range',
        units: 'μs',
        content: rangeToContentArray(
            limit === undefined
                ? []
                : [
                      { label: 'Min', value: limit.min },
                      { label: 'Avg', value: limit.avg },
                      { label: 'Max', value: limit.max },
                  ]
        ),
    };

    return (
        <div>
            <div className="extra-panel-information-container">
                <span className="extra-panel-information-header">{title}</span>
                <span className="extra-panel-information-title">Definition</span>
                <span className="extra-panel-information-value">{definition}</span>
            </div>
            {limit !== undefined && <ExtraPanelInformation displayData={extraPanelData} />}
        </div>
    );
};

export default MinMaxAvgRangeAdditionalInformation;
