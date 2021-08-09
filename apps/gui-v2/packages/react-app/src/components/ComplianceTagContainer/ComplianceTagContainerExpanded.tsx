import React from 'react';
import { IComponentProps as ComplianceTagInterface } from '../ComplianceTag/ComplianceTag';
import { ComplianceTag } from '../index';
import './styles.scss';
import { ArrowExpandedIcon } from '../icons';
import { translate } from '../../utils/translation';

function ComplianceTagContainerExpanded({
    complianceTagList,
    onClick,
}: {
    complianceTagList: Array<ComplianceTagInterface>;
    onClick: () => void;
}) {
    return (
        <div>
            <div className="compliant-tag-container-expanded" onClick={onClick}>
                <span>{translate('stream.compliance')}</span>
                <ArrowExpandedIcon className="compliance-tag-container-arrow-icon" />
            </div>
            <div className="compliant-tag-container-list">
                {complianceTagList.map((item, index) => (
                    <ComplianceTag tagInformation={item} key={index} />
                ))}
            </div>
        </div>
    );
}

export default ComplianceTagContainerExpanded;
