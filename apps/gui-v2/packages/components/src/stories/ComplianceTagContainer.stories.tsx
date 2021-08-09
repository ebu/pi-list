// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { ComplianceTagContainer } from '../index';

const complianceTagList = [
    {
        compliant: false,
        text: 'SMPTE 2110-21 (VRX)',
    },
    {
        compliant: false,
        text: 'RTP sequence',
    },
    {
        compliant: true,
        text: 'Destination Multicast IP address',
    },
    {
        compliant: false,
        text: 'SMPTE 2110-21 (Cinst)',
    },
    {
        compliant: true,
        text: 'Cinst',
    },
    {
        compliant: true,
        text: 'Destination Multicast IP address',
    },
    {
        compliant: true,
        text: 'Inter-frame RTP timestamps delt',
    },
    {
        compliant: false,
        text: 'RTP sequence',
    },
];

// This default export determines where your story goes in the story list
export default {
    title: 'Compliance Tag Container',
    component: ComplianceTagContainer,
};

const Template: Story<ComponentProps<typeof ComplianceTagContainer>> = () => (
    <div style={{ backgroundColor: '#081131', width: '310px', height: '600px' }}>
        <ComplianceTagContainer complianceTagList={complianceTagList} />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
