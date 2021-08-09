// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { HeaderHOC } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Header',
    component: HeaderHOC,
};

const pcapsCount = { totalPcaps: 10, notCompliantStreams: 8, compliantStreams: 2 };

const Template: Story<ComponentProps<typeof HeaderHOC>> = args => (
    <div style={{ background: 'linear-gradient(291.34deg, #080d21 0%, #081131 100%)', height: '150px' }}>
        <HeaderHOC {...args} />
    </div>
);

export const HeaderWithDropdownMenu = Template.bind({});
HeaderWithDropdownMenu.args = {
    pcapsCount: pcapsCount,
    dropdownMenu: true,
};

export const Header = Template.bind({});
Header.args = {
    pcapsCount: pcapsCount,
    dropdownMenu: false,
};
