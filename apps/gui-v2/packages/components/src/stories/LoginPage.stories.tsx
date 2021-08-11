// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { LoginPage } from '../index';

// This default export determines where your story goes in the story list
export default {
  title: 'Login Page',
  component: LoginPage,
};

const Template: Story<ComponentProps<typeof LoginPage>> = () => <LoginPage />;

export const FirstStory = Template.bind({});
FirstStory.args = {
  /* the args you need here will depend on your component */
};
