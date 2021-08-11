// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { UploadPcap } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Upload Pcap',
    component: UploadPcap,
};

const Template: Story<ComponentProps<typeof UploadPcap>> = () => (
    <div className="sb-drag-and-drop-upload-container">
        <div className="sb-drag-and-drop-upload">
            <UploadPcap />
        </div>
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
