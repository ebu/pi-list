import React from 'react';
import { InformationSidebar } from 'components/index';
import './styles.scss';
interface ISidebarContent {
    usermail: string;
    content?: React.ReactElement;
}

interface IComponentProps {
    middlePageContent: React.ReactElement;
    informationSidebarContent?: ISidebarContent;
    logout?: () => void;
}

function MainContentLayout({ middlePageContent, informationSidebarContent, logout }: IComponentProps) {
    return (
        <>
            <main className="main-page-main-content">{middlePageContent}</main>
            {informationSidebarContent && logout ? (
                <div className="main-page-right-sidebar">
                    <div className="blend-div"></div>
                    <InformationSidebar
                        usermail={informationSidebarContent.usermail}
                        content={informationSidebarContent.content}
                        logout={logout}
                    />
                </div>
            ) : null}
        </>
    );
}

export default MainContentLayout;
