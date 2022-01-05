import React, { ReactElement } from 'react';
import SDK from '@bisect/ebu-list-sdk';
import { CustomScrollbar } from 'components/index';
import DashboardHeaderHOC from './Header/DashboardHeaderHOC';
import { DashboardTilesView, DashboardHybridView, DashboardTableView } from './DashboardViews';
import { DashboardTilesViewIcon, DashboardTableViewIcon, DashboardHybridViewIcon } from 'components/icons/index';
import viewNames from '../../enums/viewNames';
import './styles.scss';

interface IDashboardButtonProps {
    onClick: () => void;
    icon: ReactElement;
}
const DashboardViewButton: React.FunctionComponent<IDashboardButtonProps> = ({
    onClick,
    icon,
}: IDashboardButtonProps) => (
    <button className="dashboard-view" onClick={onClick}>
        {icon}
    </button>
);

const getCurrentView = (
    currentViewName: string,
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void,
    pcaps: SDK.types.IPcapInfo[],
    onRowClicked: (id: string, e: React.MouseEvent<HTMLElement>) => void,
    onDoubleClick: (id: string, analyzerVersion: string) => void,
    selectedPcapIds: string[]
): ReactElement => {
    switch (currentViewName) {
        case viewNames.TilesView:
            return (
                <DashboardTilesView
                    onClick={onClick}
                    onDoubleClick={onDoubleClick}
                    pcaps={pcaps}
                    selectedPcapIds={selectedPcapIds}
                />
            );
        case viewNames.HybridView:
            return (
                <DashboardHybridView
                    onRowClicked={onRowClicked}
                    onDoubleClick={onDoubleClick}
                    onClick={onClick}
                    pcaps={pcaps}
                    selectedPcapIds={selectedPcapIds}
                />
            );

        case viewNames.TableView:
        default:
            return (
                <DashboardTableView
                    onRowClicked={onRowClicked}
                    onDoubleClick={onDoubleClick}
                    pcaps={pcaps}
                    selectedPcapIds={selectedPcapIds}
                />
            );
    }
};

interface IPropTypes {
    onClick: (id: string, e: React.MouseEvent<HTMLElement>) => void;
    pcaps: SDK.types.IPcapInfo[];
    onViewClick: (viewType: string) => void;
    currentViewName: string;
    onDoubleClick: (id: string, analyzerVersion: string) => void;
    onHeaderFilterClick: (filterType: number) => void;
    pcapsCount: { totalPcaps: number; notCompliantStreams: number; compliantStreams: number };
    currentSelection: number;
    selectedPcapIds: string[];
}

const DashboardContent: React.FunctionComponent<IPropTypes> = ({
    onClick,
    pcaps,
    onViewClick,
    currentViewName,
    onDoubleClick,
    onHeaderFilterClick,
    pcapsCount,
    currentSelection,
    selectedPcapIds,
}: IPropTypes) => {
    const currentView = getCurrentView(currentViewName, onClick, pcaps, onClick, onDoubleClick, selectedPcapIds);

    return (
        <>
            <div className="main-page-header">
                <DashboardHeaderHOC
                    onHeaderFilterClick={onHeaderFilterClick}
                    pcapsCount={pcapsCount}
                    currentSelection={currentSelection}
                />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    <div className="dashboard-views-icons-container">
                        <div className="dashboard-views-icons">
                            <DashboardViewButton
                                onClick={() => onViewClick('tilesView')}
                                icon={<DashboardTilesViewIcon />}
                            />
                            <DashboardViewButton
                                onClick={() => onViewClick('hybridView')}
                                icon={<DashboardHybridViewIcon />}
                            />
                            <DashboardViewButton
                                onClick={() => onViewClick('tableView')}
                                icon={<DashboardTableViewIcon />}
                            />
                        </div>
                    </div>
                    {currentView}
                </CustomScrollbar>
            </div>
        </>
    );
};

export default DashboardContent;
