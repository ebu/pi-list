import React from 'react';
import './styles.scss';
import { ArrowCollapsedIcon } from '../icons/index';
import { translate } from '../../utils/translation';

function ComplianceTagContainerCollapsed({ onClick }: { onClick: () => void }) {
    return (
        <div>
            <div className="compliant-tag-container-collapsed" onClick={onClick}>
                <span>{translate('stream.compliance')}</span>
                <ArrowCollapsedIcon className="compliance-tag-container-arrow-icon" />
            </div>
        </div>
    );
}

export default ComplianceTagContainerCollapsed;
