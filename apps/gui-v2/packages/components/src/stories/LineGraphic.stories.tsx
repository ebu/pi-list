// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { LineGraphic } from '../index';

const data = {
    graphicData: [
        {
            value: -979,
            time: '2017-08-16T18:22:03.888779Z',
        },
        {
            value: -979,
            time: '2017-08-16T18:22:04.089776Z',
        },
        {
            value: -979,
            time: '2017-08-16T18:22:05.888779Z',
        },
        {
            value: -1002,
            time: '2017-08-16T18:22:06.089776Z',
        },
        {
            value: -1000,
            time: '2017-08-16T18:22:07.888779Z',
        },
    ],
    // graphicData: [
    //     { value: -3618.78, time: '2017-08-16T18:22:03.704401Z' },
    //     { value: -3617.78, time: '2017-08-16T18:22:03.7244Z' },
    //     { value: -3618.78, time: '2017-08-16T18:22:03.744401Z' },
    //     { value: -3617.78, time: '2017-08-16T18:22:03.7644Z' },
    //     { value: -3617.78, time: '2017-08-16T18:22:03.7844Z' },
    // ],
    toleranceValue: -900,
    title: 'Teste',
    leftMargin: 10,
    xAxisTitle: 'Time',
    yAxisTitle: 'RTP time step (μs)',
    datakeyY: 'value',
    datakeyX: 'time',
};

// This default export determines where your story goes in the story list
export default {
    title: 'Line Graphic',
    component: LineGraphic,
};

const Template: Story<ComponentProps<typeof LineGraphic>> = () => (
    <div style={{ background: 'linear-gradient(291.34deg, #080d21 0%, #081131 100%)', borderRadius: '8px' }}>
        <LineGraphic data={data} />;
    </div>
);

export const FirstStory = Template.bind({});
FirstStory.args = {
    /* the args you need here will depend on your component */
};
