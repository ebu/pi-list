import React from 'react';
import './styles.scss';
import { LeftArrowIcon } from '../icons/index';
import { CustomScrollbar } from 'components/index';

interface IComponentProps {
    streamsList: Array<ISidebarItem>;
    onItemClicked: (id: string) => void;
    activeStreamId: string | undefined;
    onBackButtonClick?: () => void;
}

function SidebarStreamsList({ streamsList, onItemClicked, activeStreamId, onBackButtonClick }: IComponentProps) {
    return (
        <div className="sidebar-helper-container">
            <div className="sidebar-helper-title" onClick={onBackButtonClick}>
                <LeftArrowIcon />
                <span>Dashboard</span>
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    {streamsList.map((item, index) => (
                        <div
                            onClick={() => onItemClicked(item.id)}
                            className={
                                item.id === activeStreamId
                                    ? 'sidebar-helper-information-active'
                                    : 'sidebar-helper-information'
                            }
                            key={index}
                        >
                            <div
                                className={
                                    item.id === activeStreamId
                                        ? 'sidebar-helper-index-type-active'
                                        : 'sidebar-helper-index-type'
                                }
                            >
                                <span>{item.key + ' ' + item.fullType}</span>
                            </div>
                            <div
                                className={
                                    item.id === activeStreamId
                                        ? 'sidebar-helper-protocol-active'
                                        : 'sidebar-helper-protocol'
                                }
                            >
                                <span>{item.protocol + ' - ' + item.transport_type}</span>
                                {item.hasError ? <span className="sidebar-stream-list-red-dot"></span> : null}
                            </div>
                        </div>
                    ))}
                </CustomScrollbar>
            </div>
        </div>
    );
}

export interface ISidebarItem {
    id: string;
    key: string;
    type: string;
    fullType: string;
    hasError: boolean;
    protocol: string;
    transport_type: string;
}

export default SidebarStreamsList;
