import React from 'react';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { useHistory } from 'react-router-dom';
import routeBuilder from '../../routes/routeBuilder';
import {
    CustomScrollbar,
    ContextHelp,
    PCapDetails,
    StreamsSidebarInfo,
    ButtonWithIconSidebarContainer,
    Notification,
} from 'components/index';
import { CalendarIcon, BinIcon, DownloadIcon, AlertIcon } from 'components/icons';
import { translate } from '../../utils/translation';
import DashboardContent from './DashboardContent';
import MainContentLayout from '../Common/MainContentLayout';
import filterHeaderNames from '../../enums/filterHeaderNames';
import { useRecoilValue } from 'recoil';
import { pcapsAtom } from '../../store/gui/pcaps/pcaps';
import { userAtom } from '../../store/gui/user/userInfo';
import { extractFileFromResponse } from '../../utils/downloadResponseHandler';
import './styles.scss';

type IIcons = {
    text: string;
    key: number;
};

type IShortcuts = {
    key: number;
    description: string;
    icons: IIcons[];
};

interface IContextHelp {
    description: string;
    shortcuts: IShortcuts[];
}

const getContextHelp = (): IContextHelp => ({
    description: 'Choose one of the files to see the details and actions.',
    shortcuts: [
        {
            key: 0,
            description: 'Select multiple files',
            icons: [
                {
                    text: 'ctrl',
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
});

interface IPcapDetailData {
    icon: any;
    text: string;
    description: string;
}

const getPCapDetail = (currentPCap: SDK.types.IPcapInfo | null | undefined): IPcapDetailData[] | null => {
    // const analysisText = translate('media_information.analysis');
    // const captureText = translate('navigation.capture.backup');
    const analysisText = 'Analysis';
    const captureText = 'Capture';
    if (currentPCap) {
        const analysisDate = new Date(currentPCap.date).toLocaleString();
        const captureDate = new Date(currentPCap.capture_date).toLocaleString();
        const isTruncated = currentPCap.truncated;

        const PCapDetailData = [
            {
                icon: CalendarIcon,
                text: analysisText,
                description: analysisDate,
            },
            {
                icon: CalendarIcon,
                text: captureText,
                description: captureDate.toString(),
            },
        ];

        if (isTruncated) {
            PCapDetailData.push({ icon: AlertIcon, text: 'Truncated', description: 'The PCAP is truncated.' });
        }

        return PCapDetailData;
    }

    return null;
};

const getMultipleFilesDownload = async (type: string, pCapIdsToDownload: string[]) => {
    // const workflowRequest = translate('workflow.requested');
    const workflowRequest = 'Workflow requested';
    const workflowRequestFailed = 'Workflow request failed';

    const workflowInfo = {
        type: 'downloadMultipleFiles',
        configuration: {
            ids: pCapIdsToDownload,
            type: type,
        },
    };
    await list.workflows
        .create(workflowInfo)
        .then(() => {
            Notification({ typeMessage: 'sucess', message: workflowRequest });
        })
        .catch((err: Error) => {
            Notification({
                typeMessage: 'error',
                message: workflowRequestFailed,
            });
        });
};

const downloadPcaps = async (currentPCapIds: string[], type: string) => {
    const isMultipleFiles = currentPCapIds.length > 1;
    switch (type) {
        case 'pcap':
            if (isMultipleFiles) {
                await getMultipleFilesDownload('pcap', currentPCapIds);
            } else {
                await list.pcap
                    .downloadPcap(currentPCapIds[0])
                    .then((response: any) => extractFileFromResponse(response));
            }
            break;
        case 'sdp':
            if (isMultipleFiles) {
                await getMultipleFilesDownload('sdp', currentPCapIds);
            } else {
                await list.pcap
                    .downloadSdp(currentPCapIds[0])
                    .then((response: any) => extractFileFromResponse(response));
            }
            break;
        case 'json':
            if (isMultipleFiles) {
                await getMultipleFilesDownload('json', currentPCapIds);
            } else {
                await list.pcap
                    .downloadJson(currentPCapIds[0])
                    .then((response: any) => extractFileFromResponse(response));
            }
            break;
        default:
            break;
    }
};

const deletePcaps = async (currentPCapIds: string[]) => {
    for (const currentPcapId of currentPCapIds) {
        await list.pcap.delete(currentPcapId);
    }
};

const getDataToInformationSidebar = (
    currentPCap: SDK.types.IPcapInfo | null | undefined,
    onViewAllDetailsButtonClick: (id: string) => void,
    currentPCapIds: string[],
    username: string,
    resetStateSelectedPcaps: () => void
) => {
    const pCapDetailsList = currentPCap ? getPCapDetail(currentPCap) : null;
    const shortcuts = getContextHelp();
    const totalStreams = currentPCap ? getTotalStreams(currentPCap) : null;
    const pCapDetailsRender = pCapDetailsList && (
        <div>
            <PCapDetails detailsList={pCapDetailsList} />
        </div>
    );

    //TODO Check if the current pcap id verification is correct, might lead to errors if somehow view all details buttons show without an actual pcap clicked
    const totalStreamRender = totalStreams && (
        <div>
            <StreamsSidebarInfo
                streamsTotalList={totalStreams}
                onViewAllDetailsButtonClick={onViewAllDetailsButtonClick}
                currentPCapId={currentPCap ? currentPCap.id : ''}
            />
        </div>
    );

    const buttonWithIconList = [
        {
            icon: DownloadIcon,
            text: 'Download PCAP',
            onClick: () => downloadPcaps(currentPCapIds, 'pcap'),
        },
        {
            icon: DownloadIcon,
            text: 'Download SDP',
            onClick: () => downloadPcaps(currentPCapIds, 'sdp'),
        },
        {
            icon: DownloadIcon,
            text: 'Download JSON',
            onClick: () => downloadPcaps(currentPCapIds, 'json'),
        },
        {
            icon: BinIcon,
            text: 'Remove',
            onClick: () => {
                deletePcaps(currentPCapIds);
                resetStateSelectedPcaps();
            },
        },
    ];

    const isMultipleFilesSelected = currentPCapIds.length > 1;

    const data = {
        usermail: username,
        content: (
            <div style={{ height: '100vh', overflow: 'auto' }}>
                <CustomScrollbar>
                    <div className="sb-information-sidebar-content">
                        {currentPCap || isMultipleFilesSelected ? (
                            <div>
                                <ButtonWithIconSidebarContainer buttonWithIconList={buttonWithIconList} />
                            </div>
                        ) : (
                            <div>
                                <ContextHelp shortcutsList={shortcuts} />
                            </div>
                        )}
                        {isMultipleFilesSelected ? (
                            <div>
                                <h3 className="currently-selected-pcaps">
                                    There are currently {currentPCapIds.length} PCaps selected
                                </h3>
                            </div>
                        ) : null}
                        {pCapDetailsRender}
                        {totalStreamRender}
                    </div>
                </CustomScrollbar>
            </div>
        ),
    };

    return data;
};

const getTotalStreams = (currentPCap: SDK.types.IPcapInfo) => {
    const totalStreams = currentPCap.total_streams;
    const notCompliantStreams = currentPCap.not_compliant_streams;
    const compliantStreams = totalStreams - notCompliantStreams;

    const streamsTotalList = {
        compliant: compliantStreams,
        notCompliant: notCompliantStreams,
    };

    return streamsTotalList;
};

const getFilter = (filterType: number): ((pcap: SDK.types.IPcapInfo) => boolean) => {
    switch (filterType) {
        case 0:
            return () => true;
        case 1:
            return (pcap: SDK.types.IPcapInfo) => pcap.summary !== undefined && pcap.summary.error_list.length === 0;
        case 2:
        default:
            return (pcap: SDK.types.IPcapInfo) => pcap.summary !== undefined && pcap.summary.error_list.length !== 0;
    }
};

const isCompliant = (pcap: SDK.types.IPcapInfo): boolean => pcap.summary.error_list.length === 0;

type PcapsCount = {
    totalPcaps: number;
    notCompliantStreams: number;
    compliantStreams: number;
};

const getPcapsCount = (pcaps: SDK.types.IPcapInfo[]): PcapsCount =>
    pcaps
        .filter(({ summary }) => summary !== undefined)
        .reduce(
            (acc: PcapsCount, v: SDK.types.IPcapInfo) => ({
                totalPcaps: acc.totalPcaps + 1,
                notCompliantStreams: isCompliant(v) ? acc.notCompliantStreams : acc.notCompliantStreams + 1,
                compliantStreams: isCompliant(v) ? acc.compliantStreams + 1 : acc.compliantStreams,
            }),
            { totalPcaps: 0, notCompliantStreams: 0, compliantStreams: 0 }
        );

function DashboardContentHOC() {
    const pcaps = useRecoilValue(pcapsAtom);

    const [currentPCapIds, setCurrentPCapIds] = React.useState<string[]>([]);

    const resetStateSelectedPcaps = () => setCurrentPCapIds([]);

    const onClick = (id: string, e: React.MouseEvent<HTMLElement>) => {
        if (e.ctrlKey) {
            if (currentPCapIds.includes(id)) {
                setCurrentPCapIds(currentPCapIds.filter(i => i !== id));
            } else {
                setCurrentPCapIds([...currentPCapIds, id]);
            }
        } else {
            setCurrentPCapIds([id]);
        }
    };

    const currentPCap = currentPCapIds.length === 1 ? pcaps.find(v => v.id === currentPCapIds[0]) : null;

    const [currentViewType, setCurrentViewType] = React.useState<string>('tilesView');

    const onViewClick = (viewType: string) => {
        setCurrentPCapIds([]);
        setCurrentViewType(viewType);
    };

    const [currentFilterType, setCurrentHeaderFilter] = React.useState<number>(0);

    const onHeaderFilterClick = (filterType: number): void => {
        setCurrentHeaderFilter(filterType);
    };

    const history = useHistory();

    const onDoubleClick = (id: string): void => {
        const route = routeBuilder.pcap_stream_list(id);
        history.push(route);
    };

    const onViewAllDetailsButtonClick = (id: string): void => {
        const route = routeBuilder.pcap_stream_list(id);
        history.push(route);
    };

    const predicate = getFilter(currentFilterType);

    const filteredPcaps = pcaps.filter(predicate);

    const userInfo = useRecoilValue(userAtom);

    if (!userInfo) {
        return null;
    }

    return (
        <>
            <MainContentLayout
                middlePageContent={
                    <DashboardContent
                        onDoubleClick={onDoubleClick}
                        onClick={onClick}
                        pcaps={filteredPcaps}
                        onViewClick={onViewClick}
                        currentViewName={currentViewType}
                        onHeaderFilterClick={onHeaderFilterClick}
                        pcapsCount={getPcapsCount(pcaps)}
                        currentSelection={currentFilterType}
                        selectedPcapIds={currentPCapIds}
                    />
                }
                informationSidebarContent={getDataToInformationSidebar(
                    currentPCap,
                    onViewAllDetailsButtonClick,
                    currentPCapIds,
                    userInfo?.username,
                    resetStateSelectedPcaps
                )}
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default DashboardContentHOC;
