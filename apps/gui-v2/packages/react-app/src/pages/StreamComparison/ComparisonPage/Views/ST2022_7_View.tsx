import { translate } from '../../../../utils/translation';
import { MeasurementPassCriteriaDisplay } from '../../../../components';
import { IMeasurementData } from 'utils/measurements';

const DeltaBetweenPacketsDisplay = ({ analysis }: { analysis: any }) => {
    const deltaBetweenPackets = translate('workflow.st2022_7_analysis.deltaBetweenPackets');
    const measurementData: IMeasurementData = {
        title: deltaBetweenPackets,
        data: [
            {
                label: 'Min',
                value: analysis.minDeltaNs.toFixed(0),
            },
            {
                label: 'Avg',
                value: analysis.averageDeltaNs.toFixed(0),
            },
            {
                label: 'Max',
                value: analysis.maxDeltaNs.toFixed(0),
            },
        ],
        unit: 'ns',
    };

    return <MeasurementPassCriteriaDisplay displayData={measurementData} />;
};

function ST2022_7_View({ comparisonInfo }: any) {
    const workflowNamesSt2022 = translate('workflow.names.st2022_7_analysis');
    const workflowNamesSt2022TotalNumberPackets = translate('workflow.st2022_7_analysis.totalNumberOfPackets');
    const workflowNamesSt2022IntersectionSizeInPackets = translate(
        'workflow.st2022_7_analysis.intersectionSizeInPackets'
    );
    const workflowNamesSt2022NumberDifferentPackets = translate('workflow.st2022_7_analysis.numberOfDifferentPackets');
    const workflowNamesSt2022NumberMissingPackets = translate('workflow.st2022_7_analysis.numberOfMissingPackets');
    const workflowNamesSt2022NumberEqualPackets = translate('workflow.st2022_7_analysis.numberOfEqualPackets');

    if (!comparisonInfo.result.succeeded) {
        return (
            <div className="comparison-configuration-panel-subtitle">{`Error: ${comparisonInfo.result.message}`} </div>
        );
    }

    const intersection = comparisonInfo.result.analysis.intersectionSizeInPackets;
    const intersectionPercentage =
        intersection === 0 ? 100 : (intersection / comparisonInfo.result.analysis.totalNumberOfPackets) * 100;
    const numberOfEqualPackets =
        intersection -
        comparisonInfo.result.analysis.numberOfDifferentPackets -
        comparisonInfo.result.analysis.numberOfMissingPackets;
    const differentPercentage =
        intersection === 0 ? 100 : (comparisonInfo.result.analysis.numberOfDifferentPackets / intersection) * 100;
    const missingPercentage =
        intersection === 0 ? 100 : (comparisonInfo.result.analysis.numberOfMissingPackets / intersection) * 100;
    const equalPercentage = intersection == 0 ? 100 : (numberOfEqualPackets / intersection) * 100;

    return (
        <div>
            <span className="comparison-configuration-panel-title padding-to-title">{workflowNamesSt2022}</span>
            <div className="st20227-data-container">
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${workflowNamesSt2022TotalNumberPackets}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">
                        {comparisonInfo.result.analysis.totalNumberOfPackets}
                    </span>
                    <span className="comparison-configuration-panel-data"> packets</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${workflowNamesSt2022IntersectionSizeInPackets}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${intersection} (${intersectionPercentage.toFixed(
                        2
                    )}%)`}</span>
                    <span className="comparison-configuration-panel-data"> packets</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${workflowNamesSt2022NumberDifferentPackets}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${
                        comparisonInfo.result.analysis.numberOfDifferentPackets
                    } (${differentPercentage.toFixed(2)}%)`}</span>
                    <span className="comparison-configuration-panel-data"> packets</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${workflowNamesSt2022NumberMissingPackets}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${
                        comparisonInfo.result.analysis.numberOfMissingPackets
                    } (${missingPercentage.toFixed(2)}%)`}</span>
                    <span className="comparison-configuration-panel-data"> packets</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${workflowNamesSt2022NumberEqualPackets}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${numberOfEqualPackets} (${equalPercentage.toFixed(
                        2
                    )}%)`}</span>
                    <span className="comparison-configuration-panel-data"> packets</span>
                </div>
            </div>
            <DeltaBetweenPacketsDisplay analysis={comparisonInfo.result.analysis} />
        </div>
    );
}

export default ST2022_7_View;
