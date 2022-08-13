import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { nsAsMicroseconds } from 'utils/stats';
import { MeasurementMinAvgMaxDisplay } from 'components';
import { SetSidebarInfoType } from 'utils/useSidebarInfo';
import * as labels from 'utils/labels';

const pitTitleAndComment = (
    <span className="list-title-and-comment">
        <span>PIT </span>
        <span className="comment">(excluding the GAP)</span>
    </span>
);

const PitDisplay = ({
    interPacketData,
    setInfo,
}: {
    interPacketData: SDK.api.pcap.IVideoPacketSpacing;
    setInfo: SetSidebarInfoType;
}) => {
    const PitDisplayData = {
        title: pitTitleAndComment,
        min: nsAsMicroseconds(interPacketData.min),
        avg: nsAsMicroseconds(interPacketData.avg),
        max: nsAsMicroseconds(interPacketData.max),
        unit: 'ns',
    };

    const additionalInformation = (
        <div>
            <p className="extra-panel-information-header">Packet Interval Time</p>
            <p className="extra-panel-information-title">Definition</p>
            <p className="extra-panel-information-value">{labels.pitDefinition}</p>
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
    return <MeasurementMinAvgMaxDisplay displayData={PitDisplayData} actions={actions} />;
};

export default PitDisplay;
