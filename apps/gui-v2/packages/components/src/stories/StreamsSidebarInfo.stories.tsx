// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import './styles.scss';

import { StreamsSidebarInfo } from '../index';

// This default export determines where your story goes in the story list
export default {
    title: 'Streams Sidebar Info',
    component: StreamsSidebarInfo,
};

const streamsTotalList = {
    notCompliant: 21,
    compliant: 23,
};

const Template: Story<ComponentProps<typeof StreamsSidebarInfo>> = () => (
    <div className="sb-dashboard-tile">
        <StreamsSidebarInfo
            streamsTotalList={streamsTotalList}
            onViewAllDetailsButtonClick={() => console.log('Aqui')}
            currentPCapId={undefined}
        />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    /* the args you need here will depend on your component */
};
