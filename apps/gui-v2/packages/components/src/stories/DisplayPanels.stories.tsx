// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import {
    MeasurementMinAvgMaxDisplay,
    MeasurementPassCriteriaDisplay,
    SubStreamsExplorerDisplay,
} from '../../../react-app/src/components/index';

// This default export determines where your story goes in the story list
export default {
    title: 'Dispaly Panels',
    component: MeasurementMinAvgMaxDisplay && MeasurementPassCriteriaDisplay && SubStreamsExplorerDisplay,
};

const displayDataMinMaxAvg = {
    title: 'Inter-Packet Time',
    min: '3000',
    avg: '3500',
    max: '4000',
    unit: 'ns',
};

const displayDataMinMaxAvgPassCriteria = {
    measurementData: {
        title: 'CInst',
        data: [
            {
                labelTag: 'Min',
                value: '0',
            },
            {
                labelTag: 'Avg',
                value: '0',
            },
            {
                labelTag: 'Max',
                value: '0',
            },
        ],
    },
    passCriteriaData: {
        title: 'CMax',
        data: [
            {
                labelTag: 'Narrow',
                value: '4',
            },
            {
                labelTag: 'Wide',
                value: '16',
            },
        ],
    },
    unit: 'packets',
};

const displaySubStreamsExplorer = [
    {
        label: 'Type',
        value: 'Ancillary Time Code (S12M-2)',
        attention: false,
    },
    {
        label: 'DID',
        value: '0x60',
    },
    {
        label: 'SDID',
        value: '0x60',
    },
    {
        label: 'Line',
        value: '9',
    },
    {
        label: 'Horizontal offset',
        value: '1964',
    },
    {
        label: 'Payload errors',
        value: '0',
        attention: true,
    },
];

const Template: Story<ComponentProps<typeof MeasurementMinAvgMaxDisplay>> = () => (
    <>
        <div className="sb-measurement-display-container">
            <div style={{ width: '500px' }}>
                <MeasurementMinAvgMaxDisplay displayData={displayDataMinMaxAvg} />
            </div>
            <div>
                <MeasurementPassCriteriaDisplay displayData={displayDataMinMaxAvgPassCriteria} actions={undefined} />
            </div>
            <div>
                <SubStreamsExplorerDisplay displayData={displaySubStreamsExplorer} />
            </div>
        </div>
    </>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
