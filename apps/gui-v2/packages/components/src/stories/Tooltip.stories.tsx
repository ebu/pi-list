// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';

import { SimpleTooltip, TimeValueTooltip, Tooltip } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Tooltip',
    component: Tooltip,
};

const Template: Story<ComponentProps<typeof Tooltip>> = args => (
    <div className="sb-drag-and-drop-tile ">
        <Tooltip {...args} />
    </div>
);

export const TimeAndValueTooltip = Template.bind({});
TimeAndValueTooltip.args = {
    content: <TimeValueTooltip valueXLabel="Packets per frame" valueX="4" valueYLabel="Value" valueY="52" />,
    children: <div>Children</div>,
};

export const SimpleTooltipComponent = Template.bind({});
SimpleTooltipComponent.args = {
    content: <SimpleTooltip text="974 ys" />,
    children: <div>Children</div>,
};
