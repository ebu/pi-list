// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { DragAndDropTile } from '../index';

// This default export determines where your story goes in the story list
export default {
  title: 'Drag and Drop Tile',
  component: DragAndDropTile,
};

const Template: Story<ComponentProps<typeof DragAndDropTile>> = () => (
  <div className="sb-drag-and-drop-tile">
    <DragAndDropTile />
    <DragAndDropTile />
    <DragAndDropTile />
    <DragAndDropTile />
    <DragAndDropTile />
    <DragAndDropTile />
    <DragAndDropTile />
    <DragAndDropTile />
  </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
  /* the args you need here will depend on your component */
};
