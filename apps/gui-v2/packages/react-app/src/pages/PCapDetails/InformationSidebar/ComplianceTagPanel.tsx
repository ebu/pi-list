import { api, types } from '@bisect/ebu-list-sdk';
import { ComplianceTagContainer } from 'components/index';

const ComplianceTagPanel = ({ stream }: { stream: types.IStreamInfo | any | undefined }) => {
    const analyses = stream?.analyses;
    const hasError: boolean = stream?.error_list.length === 0 ? false : true;
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
    return <ComplianceTagContainer complianceTagList={dataArray} hasError={hasError} />;
};

export default ComplianceTagPanel;
