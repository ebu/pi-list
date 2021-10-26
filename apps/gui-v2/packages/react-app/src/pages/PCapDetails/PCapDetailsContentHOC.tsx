import React from 'react';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { Switch, Route, BrowserRouter, useHistory } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { sidebarCollapsedAtom } from '../../store/gui/sidebar/sidebarCollapsed';
import { informationSidebarContentAtom } from '../../store/gui/informationSidebar/informationSidebarContent';
import PCapDetailsContent from './PCapDetailsContent';
import { CustomScrollbar, SidebarStreamsList, ButtonWithIconSidebarContainer } from 'components/index';
import MainContentLayout from '../Common/MainContentLayout';
import { MediaInformationPanel, ComplianceTagPanel, NetworkInformationPanel } from './InformationSidebar';
import { VideoIcon } from 'components/icons';
import './styles.scss';
import { userAtom } from '../../store/gui/user/userInfo';

const buttonWithIconList = (currentStream: SDK.types.IStreamInfo) => {
    switch (currentStream.media_type) {
        case 'video':
            return [
                {
                    icon: VideoIcon,
                    text: 'Video Analysis Explained',
                    onClick: () =>
                        window.open(
                            'https://github.com/ebu/pi-list/blob/master/docs/video_timing_analysis.md',
                            '_blank'
                        ),
                },
            ];

        case 'audio':
            return [
                {
                    icon: VideoIcon,
                    text: 'Audio Analysis Explained',
                    onClick: () =>
                        window.open(
                            'https://github.com/ebu/pi-list/blob/master/docs/audio_timing_analysis.md',
                            '_blank'
                        ),
                },
            ];
        case 'ancillary_data':
            return [
                {
                    icon: VideoIcon,
                    text: 'Ancillary Analysis Explained',
                    onClick: () =>
                        window.open('https://github.com/ebu/pi-list/blob/master/docs/ancillary_data.md', '_blank'),
                },
            ];
        default:
            return [
                {
                    icon: VideoIcon,
                    text: 'Ancillary Analysis Explained',
                    onClick: () => {},
                },
            ];
    }
};

interface IStreamsList {
    id: string;
    key: string;
    type: string;
    protocol: string;
}

const getKey = (key: number): string => (key + 1).toString().padStart(2, '0');

const getDataToInformationSidebar = (
    currentStream: SDK.types.IStreamInfo,
    informationSidebarContent: React.ReactElement | undefined,
    username: string
) => {
    const data = {
        usermail: username,
        content: (
            <div style={{ height: '100vh', overflow: 'auto' }}>
                <CustomScrollbar>
                    {currentStream.media_type !== 'unknown' ? (
                        <div className="sb-information-sidebar-content">
                            <div>
                                <ButtonWithIconSidebarContainer
                                    buttonWithIconList={buttonWithIconList(currentStream)}
                                />
                            </div>
                            {informationSidebarContent ? (
                                <div className="extra-information-sidebar-content">{informationSidebarContent}</div>
                            ) : null}
                            <div>
                                <ComplianceTagPanel stream={currentStream} />
                            </div>
                            <div>
                                <MediaInformationPanel stream={currentStream} />
                            </div>
                            <div>
                                <NetworkInformationPanel stream={currentStream} />
                            </div>
                        </div>
                    ) : (
                        <div className="sb-information-sidebar-content">
                            <div>
                                <NetworkInformationPanel stream={currentStream} />
                            </div>
                        </div>
                    )}
                </CustomScrollbar>
            </div>
        ),
    };
    return data;
};

const getStreamsToSidebarStreamsList = (streams: SDK.types.IStreamInfo[]): IStreamsList[] => {
    const streamsList: IStreamsList[] = [];

    streams.map((item, index) => {
        streamsList.push({
            id: item.id,
            key: getKey(index),
            type: item.media_type === 'ancillary_data' ? 'Ancillary' : item.media_type,
            protocol: 'ST2110',
        });
    });

    return streamsList;
};

function PCapDetailsContentHOC(props: any) {
    const { pcapID } = props.match.params;

    const [pcap, setPcap] = React.useState<SDK.types.IPcapInfo>();

    React.useEffect(() => {
        const loadStreams = async (): Promise<void> => {
            const pcapInfo = await list.pcap.getInfo(pcapID);
            setPcap(pcapInfo);
        };

        loadStreams();
    }, []);

    const pcapFilename = pcap?.file_name;

    const [activeStreamId, setActiveStreamId] = React.useState<string | undefined>(undefined);

    const history = useHistory();

    const onItemClick = (streamID: string) => {
        setActiveStreamId(streamID);
        history.push(`/pcaps/${pcapID}/streams/${streamID}`);
    };

    const initial: SDK.types.IStreamInfo[] = [];

    const [streams, setStreams] = React.useState(initial);
    React.useEffect(() => {
        const loadStreams = async (): Promise<void> => {
            const all = await list.pcap.getStreams(pcapID);
            setStreams(all);
        };
        loadStreams();
    }, []);

    const setSidebarCollapsed = useSetRecoilState(sidebarCollapsedAtom);
    React.useEffect(() => {
        setSidebarCollapsed(true);
    }, []);

    React.useEffect(() => {
        if (streams.length === 0) return;
        const firstStreamId = streams[0].id;
        onItemClick(firstStreamId);
    }, [streams]);

    const currentStream: SDK.types.IStreamInfo | undefined =
        activeStreamId === undefined ? undefined : streams.find((v: any) => v.id === activeStreamId);

    const onBackButtonClick = () => {
        history.push('/');
    };
    const informationSidebarContent = useRecoilValue(informationSidebarContentAtom);

    const userInfo = useRecoilValue(userAtom);

    if (!userInfo) {
        return null;
    }

    const renderStream = (match: any, streams: SDK.types.IStreamInfo[]) => {
        return (
            <div className="pcap-details-content-layout">
                <div className="pcap-details-content-sidebar-streams-list">
                    <SidebarStreamsList
                        streamsList={getStreamsToSidebarStreamsList(streams)}
                        onItemClicked={onItemClick}
                        activeStreamId={activeStreamId}
                        onBackButtonClick={onBackButtonClick}
                    />
                </div>
                <div>
                    <PCapDetailsContent
                        currentStream={currentStream}
                        pcapFilename={pcapFilename}
                        pcapID={pcapID}
                        pcap={pcap}
                    />
                </div>
            </div>
        );
    };

    const middleContent = (
        <BrowserRouter>
            <Switch>
                <Route
                    path={`/pcaps/${pcapID}/streams/:streamID?`}
                    render={props => renderStream(props.match, streams)}
                />
            </Switch>
        </BrowserRouter>
    );

    return (
        <>
            {currentStream && (
                <MainContentLayout
                    middlePageContent={middleContent}
                    informationSidebarContent={getDataToInformationSidebar(
                        currentStream,
                        informationSidebarContent,
                        userInfo?.username
                    )}
                    logout={() => history.push('/logout')}
                />
            )}
        </>
    );
}

export default PCapDetailsContentHOC;
