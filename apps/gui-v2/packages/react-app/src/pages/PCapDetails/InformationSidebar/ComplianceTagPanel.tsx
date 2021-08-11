import { api, types } from '@bisect/ebu-list-sdk';
import { ComplianceTagContainer } from 'components/index';

const ComplianceTagPanel = ({ stream }: { stream: types.IStreamInfo | undefined }) => {
    const analyses = stream?.analyses;
    if (!analyses) return null;
    const dataArray: any = [];
    const badges = Object.keys(analyses)
        .sort()
        .map(analysis => {
            const compliance = analyses[analysis].result === api.constants.analysisConstants.outcome.compliant;
            const analysisNames: { [key: string]: string | undefined } = api.constants.analysisConstants.analysesNames;
            const name = analysisNames[analysis];
            if (!name) return null;
            const data = {
                text: name,
                compliant: compliance,
            };
            dataArray.push(data);
        });
    return <ComplianceTagContainer complianceTagList={dataArray} />;
};

export default ComplianceTagPanel;
