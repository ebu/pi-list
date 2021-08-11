// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { ContextHelp } from '../index';

// This default export determines where your story goes in the story list
export default {
  title: 'Context Help',
  component: ContextHelp,
};

const Template: Story<ComponentProps<typeof ContextHelp>> = args => (
  <div className="sb-drag-and-drop-tile ">
    <ContextHelp {...args} />
  </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
  shortcutsList: {
    description: 'Please choose one of the files to see all the details and actions.',
    shortcuts: [
      {
        key: 0,
        description: 'Select multiple files',
        icons: [
          {
            text: '^',
            key: 0,
          },
          {
            text: 'left-click',
            key: 1,
          },
        ],
      },
      {
        key: 1,
        description: 'View all details',
        icons: [
          {
            text: 'dbl click',
            key: 0,
          },
        ],
      },
    ],
  },
};
