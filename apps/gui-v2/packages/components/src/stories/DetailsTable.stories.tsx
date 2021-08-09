// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { DetailsTableHOC } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Details Table',
    component: DetailsTableHOC,
};

const detailsTableData = [
    {
        id: '0',
        filename: 'Eemebe_t_1080i59.pcap.gz',
        index: 0,
        compliant: false,
        video: 7,
        audio: 0,
        ancillary: 0,
        unknown: 2,
    },
    {
        id: '1',
        filename: 'FR_9_v3-A.cap',
        index: 13,
        compliant: true,
        video: 0,
        audio: 4,
        ancillary: 0,
        unknown: 7,
    },
    {
        id: '2',
        filename: 'Eemebe_t_1080i59.pcap.gz',
        index: 2,
        compliant: true,
        video: 0,
        audio: 7,
        ancillary: 8,
        unknown: 0,
    },
    {
        id: '3',
        filename: 'FR_9_v3-A.cap',
        index: 3,
        compliant: true,
        video: 0,
        audio: 4,
        ancillary: 0,
        unknown: 7,
    },
];

const Template: Story<ComponentProps<typeof DetailsTableHOC>> = () => (
    <div
        style={{
            background: 'linear-gradient(291.34deg, #080d21 0%, #081131 100%)',
            width: '1000px',
            height: '1000px',
        }}
    >
        <DetailsTableHOC
            detailsTableData={detailsTableData}
            onRowClicked={(id: string) => console.log('Row Clicked')}
            onDoubleClick={() => console.log('Double Clicked')}
            selectedPcapIds={[]}
        />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
