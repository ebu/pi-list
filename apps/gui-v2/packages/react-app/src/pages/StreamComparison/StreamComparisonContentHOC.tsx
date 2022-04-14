import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../../store/gui/user/userInfo';
import { MainContentLayout } from '../Common';
import StreamComparisonContent from './StreamComparisonContent';
import { pcapsAtom } from '../../store/gui/pcaps/pcaps';
import { ButtonWithIcon, CustomScrollbar } from 'components';
import { GoogleAnalyticsHandler } from 'utils/googleAnalytics';
import { BinIcon } from 'components/icons';
import list from '../../utils/api';

export const workflowTypes = {
    compareStreams: 'compareStreams',
    st2022_7_analysis: 'st2022_7_analysis',
};

export const comparisonTypes = {
    transitDelay: 'transitDelay',
    diffTransitDelay: 'diffTransitDelay',
    networkRedundancy: 'networkRedundancy',
    avSync: 'avSync',
};

function StreamComparisonContentHOC() {
    const navigate = useNavigate();
    const pcaps = useRecoilValue(pcapsAtom);
    const userInfo = useRecoilValue(userAtom);
    const [gdprConsent, setGdprConsent] = React.useState<boolean>();

    React.useEffect(() => {
        const gdprConsentLocalStorage = localStorage.getItem('gdprConsent');
        if (gdprConsentLocalStorage) {
            setGdprConsent(gdprConsentLocalStorage === 'true' ? true : false);
        }
    }, []);

    const pagePath: string = window.location.pathname;

    const [selectedWorkflow, setSelectedWorkflow] = React.useState<string>(workflowTypes.compareStreams);
    const [selectedComparison, setSelectedComparison] = React.useState<string>('');
    const [currentComparisonsIds, setCurrentComparisonsIds] = React.useState<string[]>([]);

    if (!userInfo) {
        return null;
    }

    const getComparisonTypesDescription = () => {
        switch (selectedComparison) {
            case comparisonTypes.transitDelay:
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Media Transit</span>
                        <span className="comparison-types-description-text">
                            This method measures the evolution of a media content through a processing unit by comparing
                            the input multicast stream with the newly generated multicast at the output. The result is
                            the transit delay and the transparency (the unit is transparent if the media is NOT altered
                            during the processing/transit).
                        </span>
                        <span className="comparison-types-description-title">Supported Media</span>
                        <span className="comparison-types-description-text">Video or audio</span>
                        <span className="comparison-types-description-title">Method</span>
                        <span className="comparison-types-description-text">Psnr or x-corr</span>
                    </div>
                );
            case comparisonTypes.diffTransitDelay:
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Differential Media Transit</span>
                        <span className="comparison-types-description-text">
                            This method compares 2 media streams derived from the same initial stream. The
                            implementation and results are the same as "Media transit".
                        </span>
                        <span className="comparison-types-description-title">Supported Media</span>
                        <span className="comparison-types-description-text">Video or audio</span>
                        <span className="comparison-types-description-title">Method</span>
                        <span className="comparison-types-description-text">Psnr or x-corr</span>
                    </div>
                );
            case comparisonTypes.networkRedundancy:
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Network redundancy</span>
                        <span className="comparison-types-description-text">
                            This method checks the output of an equipment with a redundant interface and reports
                            ressemblance statistics.
                        </span>
                        <span className="comparison-types-description-title">Supported Media</span>
                        <span className="comparison-types-description-text">Any</span>
                        <span className="comparison-types-description-title">Method</span>
                        <span className="comparison-types-description-text">ST 2022-7 analysis</span>
                    </div>
                );
            case comparisonTypes.avSync:
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Audio-to-Video Sync</span>
                        <span className="comparison-types-description-text">
                            This measurement is a manual operation that lets the user visualize the decoded frames and
                            audio waveform side by side and place time makers on each. The delay is computed in both
                            network domain (packet capture timestamps) and media domain (RTP timestamps).
                        </span>
                        <span className="comparison-types-description-title">Supported Media</span>
                        <span className="comparison-types-description-text">Video or audio</span>
                        <span className="comparison-types-description-title">Method</span>
                        <span className="comparison-types-description-text">Manual</span>
                    </div>
                );
            default:
                return (
                    <div className="comparison-types-description-container">
                        <span className="comparison-types-description-title">Stream comparison</span>
                        <span className="comparison-types-description-text">
                            These methods allow to quantify the possible differences and delay between 2 streams of same
                            essence, captured simultaneously. Select 1 of the 4 types and select the red and blue
                            streams.
                        </span>
                    </div>
                );
        }
    };

    const onIconsClick = (type: string) => {
        switch (type) {
            case workflowTypes.compareStreams:
                setSelectedWorkflow(workflowTypes.compareStreams);
                break;
            case workflowTypes.st2022_7_analysis:
                setSelectedWorkflow(workflowTypes.st2022_7_analysis);
                break;
            default:
                setSelectedWorkflow('');
                return;
        }
    };

    const onSelectedComparisonClick = (type: string) => {
        setSelectedComparison(type);
    };

    const onTableRowClick = (item: any, e: React.MouseEvent<HTMLElement>) => {
        if (e.ctrlKey) {
            if (currentComparisonsIds.includes(item.id)) {
                setCurrentComparisonsIds(currentComparisonsIds.filter(i => i !== item.id));
            } else {
                setCurrentComparisonsIds([...currentComparisonsIds, item.id]);
            }
        } else {
            setCurrentComparisonsIds([item.id]);
        }
    };

    const onDeleteComparisons = async () => {
        currentComparisonsIds.forEach(async (comparisonId: string) => {
            await list.streamComparison.delete(comparisonId);
        });
    };
    const resetStateComparisonsIds = () => setCurrentComparisonsIds([]);

    const getDataToInformationSidebar = () => {
        const data = {
            usermail: userInfo?.username,
            content: (
                <div style={{ height: '100vh', overflow: 'auto' }}>
                    <CustomScrollbar>
                        <div className="sb-information-sidebar-content">
                            {getComparisonTypesDescription()}
                            {currentComparisonsIds.length > 0 ? (
                                <ButtonWithIcon
                                    icon={BinIcon}
                                    text={'Remove'}
                                    onClick={() => {
                                        onDeleteComparisons();
                                        resetStateComparisonsIds();
                                    }}
                                />
                            ) : null}
                        </div>
                    </CustomScrollbar>
                </div>
            ),
        };
        return data;
    };

    return (
        <>
            <GoogleAnalyticsHandler gdprConsent={gdprConsent} pathName={pagePath} />
            <MainContentLayout
                middlePageContent={
                    <StreamComparisonContent
                        pcaps={pcaps}
                        onIconsClick={onIconsClick}
                        selectedWorkflow={selectedWorkflow}
                        onSelectedComparisonClick={onSelectedComparisonClick}
                        selectedComparison={selectedComparison}
                        onTableRowClick={onTableRowClick}
                        selectedComparisonsIds={currentComparisonsIds}
                    />
                }
                informationSidebarContent={getDataToInformationSidebar()}
                logout={() => navigate('/logout')}
            />
        </>
    );
}

export default StreamComparisonContentHOC;
