import React from 'react';
import ComplianceTagContainerExpanded from './ComplianceTagContainerExpanded';
import ComplianceTagContainerCollapsed from './ComplianceTagContainerCollapsed';
import { IComponentProps as ComplianceTagInterface } from '../ComplianceTag/ComplianceTag';

function index({ complianceTagList }: { complianceTagList: Array<ComplianceTagInterface> }) {
    const [isExpanded, setIsExpanded] = React.useState(true);

    const onClick = () => setIsExpanded(!isExpanded);
    
    return isExpanded ?
        <ComplianceTagContainerExpanded onClick={onClick} complianceTagList={complianceTagList} />
        : <ComplianceTagContainerCollapsed onClick={onClick}/>;
}

export default index;