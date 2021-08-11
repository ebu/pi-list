// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { Slider } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Slider Audio Player',
    component: Slider,
};

const Template: Story<ComponentProps<typeof Slider>> = () => (
    <div style={{ backgroundColor: '#0a153d' }}>
        <Slider min={0} max={1} type={'volume'} onChange={(e: any) => console.log(e)} step={0.1} initialValue={1} />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
