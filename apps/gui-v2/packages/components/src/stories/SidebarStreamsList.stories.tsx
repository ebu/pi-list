// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { SidebarStreamsList, SidebarStreamsListHOC } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Sidebar Streams List',
    component: SidebarStreamsList,
};

const streamsList = [
    {
        id: '0',
        key: '0',
        type: 'video',
        protocol: 'ST 2110-20',
    },
    {
        id: '1',
        key: '1',
        type: 'video',
        protocol: 'ST 2110-20',
    },
    {
        id: '2',
        key: '2',
        type: 'audio',
        protocol: 'ST 2110-20',
    },
    {
        id: '3',
        key: '3',
        type: 'unknown',
        protocol: 'ST 2110-20',
    },
    {
        id: '4',
        key: '4',
        type: 'unknown',
        protocol: 'ST 2110-20',
    },
];

const Template: Story<ComponentProps<typeof SidebarStreamsList>> = () => (
    <div className="sb-sidebar-helper">
        <SidebarStreamsListHOC streamsList={streamsList} />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
