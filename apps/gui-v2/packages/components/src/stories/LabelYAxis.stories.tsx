// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';
import { LabelYAxis } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Label for Y Axis',
    component: LabelYAxis,
};

const Template: Story<ComponentProps<typeof LabelYAxis>> = () => <LabelYAxis title="RTP" />;

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
