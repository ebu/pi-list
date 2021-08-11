import { CustomScrollbar } from '../../../components';
import ComparisonConfigPanel from './ComparisonConfigPanel';
import ComparisonPageHeaderHOC from './Header/ComparisonPageHeaderHOC';
import ST2022_7_View from './Views/ST2022_7_View';
import PsnrAndDelayView from './Views/PsnrAndDelayView';
import CrossCorrelationView from './Views/CrossCorrelationView';
import AVSyncView from './Views/AVSyncView';
import { useHistory } from 'react-router-dom';
import routeBuilder from '../../../routes/routeBuilder';

function ComparisonPageContent({ comparisonInfo, mainPcap, referencePcap, mainStreamInfo, referenceStreamInfo }: any) {
    const changeView = (type: any) => {
        switch (type) {
            case 'psnrAndDelay':
                return (
                    <div className="comparison-page-graphics-div">
                        <PsnrAndDelayView comparisonInfo={comparisonInfo} />
                    </div>
                );
            case 'crossCorrelation':
                return (
                    <div className="comparison-page-graphics-div">
                        <CrossCorrelationView comparisonInfo={comparisonInfo} />
                    </div>
                );
            case 'AVSync':
                return (
                    <div className="comparison-page-graphics-div">
                        <AVSyncView
                            comparisonInfo={comparisonInfo}
                            mainStreamInfo={mainStreamInfo}
                            referenceStreamInfo={referenceStreamInfo}
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const history = useHistory();

    const onStreamBadgeClick = (pcapId: string, streamId: string) => {
        history.push(`/pcaps/${pcapId}/streams/${streamId}`);
    };

    return (
        <div>
            <div className="main-page-header">
                <ComparisonPageHeaderHOC />
            </div>
            <div className="main-page-dashboard">
                <CustomScrollbar>
                    {/* Include comparison Config panel and based on comparison type show different components */}
                    <div className="comparison-page-content-container">
                        <ComparisonConfigPanel
                            comparisonInfo={comparisonInfo}
                            mainPcap={mainPcap}
                            referencePcap={referencePcap}
                            mainStreamInfo={mainStreamInfo}
                            referenceStreamInfo={referenceStreamInfo}
                            onStreamBadgeClick={onStreamBadgeClick}
                        />
                        {comparisonInfo.type === 'st2022_7_analysis' ? (
                            <ST2022_7_View comparisonInfo={comparisonInfo} />
                        ) : (
                            changeView(comparisonInfo.config.comparison_type)
                        )}
                    </div>
                </CustomScrollbar>
            </div>
        </div>
    );
}

export default ComparisonPageContent;
