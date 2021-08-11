// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { StatusTag } from '../index';

// This default export determines where your story goes in the story list
export default {
  title: 'Status Tag',
  component: StatusTag,
};

const status = {
  compliant: true,
};

const Template: Story<ComponentProps<typeof StatusTag>> = () => <StatusTag status={status} />;

export const FirstStory = Template.bind({});
FirstStory.args = {
  /* the args you need here will depend on your component */
};
