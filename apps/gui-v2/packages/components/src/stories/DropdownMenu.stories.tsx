// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';
import { ArrowCollapsedIcon } from '../icons';

import { DropdownMenu } from '../index';

// This default export determines where your story goes in the story list
export default {
  title: 'Drop Down Menu',
  component: DropdownMenu,
};

const data = [
  {
    value: '1',
    label: 'teste1',
    disabled: true,
  },
  {
    value: '2',
    label: 'teste2',
  },
  {
    value: '3',
    label: 'teste3',
  },
];

const button = (
  <div className="sb-dropdown-menu-button-container">
    <span>Analysis Profile</span>
    <ArrowCollapsedIcon />
  </div>
);

const Template: Story<ComponentProps<typeof DropdownMenu>> = args => (
  <div style={{ width: '500px', background: '#081131' }}>
    <DropdownMenu {...args} width={20} options={data} button={button} onChange={() => console.log('Aqui')} />
  </div>
);

export const Normal = Template.bind({});
Normal.args = {
  className: '',
  disabled: false,
  /* the args you need here will depend on your component */
};

export const Disabled = Template.bind({});
Disabled.args = {
  className: 'is-disabled',
  disabled: true,
  /* the args you need here will depend on your component */
};

export const Right = Template.bind({});
Right.args = {
  className: 'is-right',
  disabled: false,
  /* the args you need here will depend on your component */
};
