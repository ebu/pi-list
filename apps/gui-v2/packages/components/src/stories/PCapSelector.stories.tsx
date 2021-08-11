// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';

import { PCapSelector } from '../index';
// This default export determines where your story goes in the story list
export default {
    title: 'PCap Selector',
    component: PCapSelector,
};

const Template: Story<ComponentProps<typeof PCapSelector>> = args => {
    return (
        <div className="sb-drag-and-drop-tile">
            <PCapSelector pcaps={[{ file_name: 'Teste', id: '123123123123213' }]} />
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    /* the args you need here will depend on your component */
};
