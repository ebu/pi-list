// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { MediaInformation } from '../index';

const informationStreamsList = [
    {
        title: 'protocolValue',
        value: 'ST2110',
    },
    {
        title: 'sourceMacValue',
        value: '00:90:F9:34:33:35',
    },
    {
        title: 'destinationMacValue',
        value: '01:00:5E:14:A1:01',
    },
    {
        title: 'sourceValue',
        value: '192.168.20.161:50000',
    },
    {
        title: 'protdestinationValueocolValue',
        value: '239.20.161.1:50000',
    },
];

// This default export determines where your story goes in the story list
export default {
    title: 'Media Information',
    component: MediaInformation,
};

const Template: Story<ComponentProps<typeof MediaInformation>> = () => (
    <div className="sb-dashboard-tile">
        <MediaInformation informationStreamsList={informationStreamsList} title={'Media Information'} />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
