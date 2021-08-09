// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';
import { CalendarIcon } from '../icons/index';

import { ButtonWithIconSidebarContainer } from '../index';

// This default export determines where your story goes in the story list
export default {
  title: 'Button with Icon Sidebar Container',
  component: ButtonWithIconSidebarContainer,
};

const buttonWithIconList = [
  {
    icon: CalendarIcon,
    text: 'Analysis',
    onClick: () => console.log(),
  },
  {
    icon: CalendarIcon,
    text: 'Capture',
    onClick: () => console.log(),
  },
  {
    icon: CalendarIcon,
    text: 'PTP',
    onClick: () => console.log(),
  },
];

const Template: Story<ComponentProps<typeof ButtonWithIconSidebarContainer>> = () => (
  <ButtonWithIconSidebarContainer buttonWithIconList={buttonWithIconList} />
);

export const FirstStory = Template.bind({});
FirstStory.args = {
  /* the args you need here will depend on your component */
};
