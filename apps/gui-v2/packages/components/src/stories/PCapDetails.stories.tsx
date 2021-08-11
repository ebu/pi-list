// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';

import { PCapDetails } from '../index';

import { CalendarIcon } from '../icons/index';

// This default export determines where your story goes in the story list
export default {
  title: 'PCap Details',
  component: PCapDetails,
};

const details = [
  {
    icon: CalendarIcon,
    text: 'Analysis',
    description: '2020.12-12 12 PM',
  },
  {
    icon: CalendarIcon,
    text: 'Capture',
    description: '2020.12-12 122 PM',
  },
];

const Template: Story<ComponentProps<typeof PCapDetails>> = args => (
  <div className="sb-drag-and-drop-tile">
    <PCapDetails detailsList={details} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  /* the args you need here will depend on your component */
};
