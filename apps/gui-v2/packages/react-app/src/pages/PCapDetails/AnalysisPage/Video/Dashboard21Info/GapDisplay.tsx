import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { nsAsMicroseconds } from 'utils/stats';
import { MeasurementMinAvgMaxDisplay } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const GapDisplay = ({
    gapData,
    setInfo,
}: {
    gapData: SDK.api.pcap.IVideoPacketSpacing;
    setInfo: SetSidebarInfoType;
}) => {
    const gapDisplayData = {
        title: 'GAP',
        min: nsAsMicroseconds(gapData.min),
        avg: nsAsMicroseconds(gapData.avg),
        max: nsAsMicroseconds(gapData.max),
        unit: 'μs',
    };

    const additionalInformation = (
        <div>
            <p className="extra-panel-information-header">GAP</p>
            <p className="extra-panel-information-title">Definition</p>
            <p className="extra-panel-information-value">{labels.gapDefinition}</p>
        </div>
    );

    const actions = {
        onMouseEnter: () => {
            setInfo(additionalInformation);
        },
        onMouseLeave: () => {
            setInfo(undefined);
        },
    };

    return <MeasurementMinAvgMaxDisplay displayData={gapDisplayData} actions={actions} />;
};

export default GapDisplay;
