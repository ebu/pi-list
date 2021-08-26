import React from 'react';
import { useHistory } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../../../store/gui/user/userInfo';
import { MainContentLayout } from '../../Common';
import ComparisonPageContent from './ComparisonPageContent';
import list from '../../../utils/api';
import { CustomScrollbar } from 'components';

function ComparisonPageContentHOC(props: any) {
    const [comparisonInfo, setComparisonInfo] = React.useState<any>();
    const [mainPcap, setMainPcap] = React.useState<any>();
    const [referencePcap, setReferencePcap] = React.useState<any>();
    const [mainStreamInfo, setMainStreamInfo] = React.useState<any>();
    const [referenceStreamInfo, setReferenceStreamInfo] = React.useState<any>();

    const { comparisonId } = props.match.params;

    const history = useHistory();
    const userInfo = useRecoilValue(userAtom);
    console.log(comparisonInfo);
    const getHelpMessage = () => {
        if (comparisonInfo.type === 'st2022_7_analysis') {
            return (
                <div>
                    <span className="comparison-types-description-title">Help documentation</span>
                    <a href="https://github.com/ebu/pi-list/blob/master/docs/ST_2022-7.md" target="_blank">
                        <button className="stream-comparison-panel-compare-button">ST_2022-7-Analysis</button>
                    </a>
                </div>
            );
        }
        switch (comparisonInfo.config.comparison_type) {
            case 'psnrAndDelay':
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Help documentation</span>
                        <a href="https://github.com/ebu/pi-list/blob/master/docs/v2v_comparison.md" target="_blank">
                            <button className="stream-comparison-panel-compare-button">PSNR</button>
                        </a>
                    </div>
                );
            case 'crossCorrelation':
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Help documentation</span>
                        <a href="https://github.com/ebu/pi-list/blob/master/docs/a2a_comparison.md" target="_blank">
                            <button className="stream-comparison-panel-compare-button">X-corr</button>
                        </a>
                    </div>
                );
            case 'AVSync':
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Help</span>
                        <span className="comparison-types-description-text">
                            1) In the video explorer select a frame
                            which can be associated to an audio event.
                        </span>
                        <span className="comparison-types-description-text">
                            2) In the audio waveform, find this event
                            and click to place a cursor.
                        </span>
                        <span className="comparison-types-description-text">
                            3) Read the updated delay
                        </span>
                        <span className="comparison-types-description-title">Documentation</span>
                        <a href="https://github.com/ebu/pi-list/blob/master/docs/a2v_sync.md" target="_blank">
                            <button className="stream-comparison-panel-compare-button">AVSync</button>
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };

    React.useEffect(() => {
        const loadComparisonData = async (): Promise<void> => {
            await list.streamComparison.getInfo(comparisonId).then(async (comparisonData: any) => {
                setComparisonInfo(comparisonData);
                await list.pcap.getInfo(comparisonData.config.main.pcap).then(async (data: any) => {
                    setMainPcap(data);
                    await list.stream
                        .getStreamInfo(data.id, comparisonData.config?.main?.stream)
                        .then((data: any) => setMainStreamInfo(data));
                });
                await list.pcap.getInfo(comparisonData.config.reference.pcap).then(async (data: any) => {
                    setReferencePcap(data);
                    await list.stream
                        .getStreamInfo(data.id, comparisonData.config?.reference?.stream)
                        .then((data: any) => setReferenceStreamInfo(data));
                });
            });
        };
        loadComparisonData();
    }, []);

    if (!userInfo || !comparisonInfo || !mainPcap || !referencePcap || !mainStreamInfo || !referenceStreamInfo) {
        return null;
    }

    const getDataToInformationSidebar = () => {
        const data = {
            usermail: userInfo?.username,
            content: (
                <div style={{ height: '100vh', overflow: 'auto' }}>
                    <CustomScrollbar>
                        <div className="sb-information-sidebar-content">{getHelpMessage()}</div>
                    </CustomScrollbar>
                </div>
            ),
        };
        return data;
    };

    return (
        <>
            <MainContentLayout
                middlePageContent={
                    <ComparisonPageContent
                        comparisonInfo={comparisonInfo}
                        mainPcap={mainPcap}
                        referencePcap={referencePcap}
                        mainStreamInfo={mainStreamInfo}
                        referenceStreamInfo={referenceStreamInfo}
                    />
                }
                informationSidebarContent={getDataToInformationSidebar()}
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default ComparisonPageContentHOC;
