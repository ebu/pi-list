// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { ButtonWithIcon } from '../index';
import { CalendarIcon } from '../icons/index';

// This default export determines where your story goes in the story list
export default {
  title: 'Button with Icon',
  component: ButtonWithIcon,
};

const Template: Story<ComponentProps<typeof ButtonWithIcon>> = () => (
  <ButtonWithIcon icon={CalendarIcon} text="Analysis" onClick={() => console.log('123')} />
);

export const FirstStory = Template.bind({});
FirstStory.args = {
  /* the args you need here will depend on your component */
};
