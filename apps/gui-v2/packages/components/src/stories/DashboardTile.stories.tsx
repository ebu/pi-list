// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';

import { DashboardTile } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Dashboard Tile',
    component: DashboardTile,
    argTypes: {
        content: { control: { type: 'object' } },
        title: { control: { type: 'object' } },
    },
};

const Template: Story<ComponentProps<typeof DashboardTile>> = args => (
    <div className="sb-dashboard-tile">
        <DashboardTile {...args} />
    </div>
);

export const NotCompliant = Template.bind({});
NotCompliant.args = {
    /* the args you need here will depend on your component */
    information: [
        {
            number: '03',
            title: 'Audio',
        },
        {
            number: '07',
            title: 'Video',
        },
    ],
    title: {
        titleNumber: '02',
        mainTitle: 'FR_9_v3-A.cap',
    },
    content: {
        label: 'Not Compliant',
        percentage: 100,
    },
};

export const Compliant = Template.bind({});
Compliant.args = {
    /* the args you need here will depend on your component */
    information: [
        {
            number: '03',
            title: 'Audio',
        },
        {
            number: '07',
            title: 'Video',
        },
    ],
    title: {
        titleNumber: '02',
        mainTitle: 'FR_9_v3-A.cap',
    },
    content: {
        label: 'Compliant',
        percentage: 100,
    },
};

export const Analysing = Template.bind({});
Analysing.args = {
    /* the args you need here will depend on your component */
    information: [
        {
            number: '03',
            title: 'Audio',
        },
        {
            number: '07',
            title: 'Video',
        },
    ],
    title: {
        titleNumber: '02',
        mainTitle: 'FR_9_v3-A.cap',
    },
    content: {
        label: 'Analysing',
        percentage: 80,
    },
};

export const Failed = Template.bind({});
Failed.args = {
    /* the args you need here will depend on your component */
    information: [
        {
            number: '03',
            title: 'Audio',
        },
        {
            number: '07',
            title: 'Video',
        },
    ],
    title: {
        titleNumber: '02',
        mainTitle: 'FR_9_v3-A.cap',
    },
    content: {
        label: 'Failed',
        percentage: 100,
    },
};
