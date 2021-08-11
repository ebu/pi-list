// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { CircularProgressBar } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Circular Progress Bar',
    component: CircularProgressBar,
};
const progressInfo = { filename: 'Teste', percentage: 66 };

const Template: Story<ComponentProps<typeof CircularProgressBar>> = args => (
    <div style={{ background: '#0b1845' }}>
        <CircularProgressBar {...args} />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    filename: 'Teste',
    percentage: 66,
    numberFiles: 1,
    uploadedFiles: 0,

    /* the args you need here will depend on your component */
};
