import React from 'react';
import './styles.scss';
import { api } from '@bisect/ebu-list-sdk';

function ComplianceTag({ tagInformation }: { tagInformation: ComplianceTagInterface }) {
    let colorControl = () => {
        if (
            tagInformation.compliant === api.constants.analysisConstants.outcome.compliant ||
            tagInformation.compliant === true
        ) {
            return 'compliance-tag-compliant';
        } else if (tagInformation.compliant === api.constants.analysisConstants.outcome.disabled) {
            return 'compliance-tag-disabled';
        } else if (
            tagInformation.compliant === api.constants.analysisConstants.outcome.not_compliant ||
            tagInformation.compliant === false
        ) {
            return 'compliance-tag-not-compliant';
        }
    };

    return (
        <div className={colorControl()}>
            <span>{tagInformation.text}</span>
        </div>
    );
}

export interface ComplianceTagInterface {
    compliant: string | boolean;
    text: string;
}

export default ComplianceTag;
