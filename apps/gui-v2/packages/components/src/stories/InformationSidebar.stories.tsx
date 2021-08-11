// YourComponent.stories.tsx

import React, { ComponentProps } from 'react';
import { Story } from '@storybook/react/types-6-0';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar';
import {
    InformationSidebar,
    ContextHelp,
    PCapDetails,
    StreamsSidebarInfo,
    MediaInformation,
    ComplianceTagContainer,
    ButtonWithIconSidebarContainer,
} from '../index';
import { CalendarIcon } from '../icons/index';

// This default export determines where your story goes in the story list
export default {
    title: 'Information Sidebar',
    component: InformationSidebar,
};

const shortcuts = {
    description: 'Please choose one of the files to see all the details and actions.',
    shortcuts: [
        {
            key: 0,
            description: 'Select multiple files',
            icons: [
                {
                    text: '^',
                    key: 0,
                },
                {
                    text: 'left-click',
                    key: 1,
                },
            ],
        },
        {
            key: 1,
            description: 'View all details',
            icons: [
                {
                    text: 'dbl click',
                    key: 0,
                },
            ],
        },
    ],
};

const pCapDetails = [
    {
        icon: CalendarIcon,
        text: 'Analysis',
        description: '2020.12-12 12 PM',
    },
    {
        icon: CalendarIcon,
        text: 'Capture',
        description: '2020.12-12 122 PM',
    },
];

const streamsTotalList = {
    notCompliant: 21,
    compliant: 23,
};

const informationStreamsList = [
    {
        title: 'protocolValue',
        value: 'ST2110',
    },
    {
        title: 'sourceMacValue',
        value: '00:90:F9:34:33:35',
    },
    {
        title: 'destinationMacValue',
        value: '01:00:5E:14:A1:01',
    },
    {
        title: 'sourceValue',
        value: '192.168.20.161:50000',
    },
    {
        title: 'protdestinationValueocolValue',
        value: '239.20.161.1:50000',
    },
];

const complianceTagList = [
    {
        compliant: false,
        text: 'SMPTE 2110-21 (VRX)',
    },
    {
        compliant: false,
        text: 'RTP sequence',
    },
    {
        compliant: true,
        text: 'Destination Multicast IP address',
    },
    {
        compliant: false,
        text: 'SMPTE 2110-21 (Cinst)',
    },
    {
        compliant: true,
        text: 'Cinst',
    },
    {
        compliant: true,
        text: 'Destination Multicast IP address',
    },
    {
        compliant: true,
        text: 'Inter-frame RTP timestamps delt',
    },
    {
        compliant: false,
        text: 'RTP sequence',
    },
];

const buttonWithIconList = [
    {
        icon: CalendarIcon,
        text: 'Analysis',
        onClick: () => console.log(),
    },
    {
        icon: CalendarIcon,
        text: 'Capture',
        onClick: () => console.log(),
    },
    {
        icon: CalendarIcon,
        text: 'PTP',
        onClick: () => console.log(),
    },
];

const Template: Story<ComponentProps<typeof InformationSidebar>> = args => (
    <div style={{ backgroundColor: '#0a122d', width: '310px' }}>
        <InformationSidebar {...args} />
    </div>
);

export const SidebarWithContextHelp = Template.bind({});
SidebarWithContextHelp.args = {
    usermail: 'Diego Silva',
    content: (
        <div style={{ height: 400, overflow: 'auto' }}>
            <CustomScrollbar>
                <div className="sb-information-sidebar-content">
                    <div>
                        <ContextHelp shortcutsList={shortcuts} />
                    </div>
                    <div>
                        <PCapDetails detailsList={pCapDetails} />
                    </div>
                    <div>
                        <StreamsSidebarInfo
                            streamsTotalList={streamsTotalList}
                            onViewAllDetailsButtonClick={() => console.log('Aqui')}
                            currentPCapId={undefined}
                        />
                    </div>
                    <div>
                        <MediaInformation informationStreamsList={informationStreamsList} title={'Media Information'} />
                    </div>
                    <div>
                        <ComplianceTagContainer complianceTagList={complianceTagList} />
                    </div>
                    <div>
                        <ButtonWithIconSidebarContainer buttonWithIconList={buttonWithIconList} />
                    </div>
                </div>
            </CustomScrollbar>
        </div>
    ),
};

export const SidebarWithPCapDetails = Template.bind({});
SidebarWithPCapDetails.args = {
    usermail: 'Diego Silva',
    content: (
        <div className="sb-information-sidebar-content" style={{ backgroundColor: '#0a122d' }}>
            <div>
                <PCapDetails detailsList={pCapDetails} />
            </div>
        </div>
    ),
};
