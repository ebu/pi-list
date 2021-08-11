// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';

import { AudioChannelSelector } from '../index';
// This default export determines where your story goes in the story list
export default {
    title: 'Audio Channel Selector',
    component: AudioChannelSelector,
};

const Template: Story<ComponentProps<typeof AudioChannelSelector>> = args => {
    return (
        <div className="sb-drag-and-drop-tile">
            <AudioChannelSelector channels={[{ file_name: 'Teste', id: '123123123123213' }]} />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    /* the args you need here will depend on your component */
};
