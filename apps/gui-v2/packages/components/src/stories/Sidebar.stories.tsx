// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';

import { SidebarHOC } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Sidebar',
    component: SidebarHOC,
};

const Template: Story<ComponentProps<typeof SidebarHOC>> = args => (
    <div
        style={{
            background: 'linear-gradient(291.34deg, #080d21 0%, #081131 100%)',
            width: 'fit-content',
        }}
    >
        <SidebarHOC {...args} />
    </div>
);

export const Collapsed = Template.bind({});
Collapsed.args = {
    isCollapsed: true,
    /* the args you need here will depend on your component */
};

export const NotCollapsed = Template.bind({});
NotCollapsed.args = {
    isCollapsed: false,
    /* the args you need here will depend on your component */
};
