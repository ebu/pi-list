// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { CheckboxListHOC } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Checkbox List',
    component: CheckboxListHOC,
};

const Template: Story<ComponentProps<typeof CheckboxListHOC>> = () => <CheckboxListHOC channelsNum={16} />;

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
