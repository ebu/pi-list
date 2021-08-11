// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { BarGraphic } from '../index';

const data = {
    barGraphic: [
        { value: -10, label: 'Min' },
        { value: 15, label: 'Max' },
        { value: 20, label: 'Avg' },
    ],
    referenceLines: [
        { value: 5, label: 'Wide' },
        { value: 15, label: 'Narrow' },
    ],
    compliant: false,
    title: 'VRX',
    xAxisTitle: 'Buffer Level',
    yAxisTitle: '%',
    datakeyY: 'value',
    datakeyX: 'label',
};

// This default export determines where your story goes in the story list
export default {
    title: 'Bar Graphic',
    component: BarGraphic,
};

const Template: Story<ComponentProps<typeof BarGraphic>> = () => (
    <div style={{ background: 'linear-gradient(291.34deg, #080d21 0%, #081131 100%)', borderRadius: '8px' }}>
        <BarGraphic barGraphicData={data} />
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
