import { api, types } from '@bisect/ebu-list-sdk';
import { ComplianceTagContainer } from 'components/index';
import { ComplianceTagInterface } from 'components/ComplianceTag/ComplianceTag';

const ComplianceTagPanel = ({ stream }: { stream: types.IStreamInfo | any | undefined }) => {
    const analyses = stream?.analyses;
    if (!analyses) return null;

    const hasError: boolean = stream?.error_list.length === 0 ? false : true;

    const dataArray = Object.keys(analyses)
        .sort()
        .map(analysis => {
            const compliance = analyses[analysis].result;
            const analysisNames: { [key: string]: string | undefined } = api.constants.analysisConstants.analysesNames;

            const name = analysisNames[analysis];
            if (!name) return undefined;

            if (compliance === api.constants.analysisConstants.outcome.disabled) {
                const data = {
                    text: `[Disabled] ${name}`,
                    compliant: compliance,
                };
                return data;
            }
            const data = {
                text: name,
                compliant: compliance,
            };
            return data;
        })
        .filter(x => x !== undefined) as ComplianceTagInterface[];

    return <ComplianceTagContainer complianceTagList={dataArray} hasError={hasError} />;
};

export default ComplianceTagPanel;
