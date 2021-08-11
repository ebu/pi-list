// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { StreamSelector } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Stream Selector',
    component: StreamSelector,
};

const Template: Story<ComponentProps<typeof StreamSelector>> = () => (
    <div className="sb-drag-and-drop-tile">
        <StreamSelector streams={[]} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    /* the args you need here will depend on your component */
};
