// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { ComplianceTag } from '../index';

const tagInformation = { text: 'RTP sequence', compliant: true };

// This default export determines where your story goes in the story list
export default {
  title: 'Compliance Tag',
  component: ComplianceTag,
};

const Template: Story<ComponentProps<typeof ComplianceTag>> = args => (
  <div style={{ width: '200px', background: 'rgba(255, 255, 255, 0.42)', mixBlendMode: 'overlay' }}>
    <ComplianceTag {...args} />
  </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
  tagInformation: { text: 'RTP sequence', compliant: true },
  /* the args you need here will depend on your component */
};
