import React from 'react';
import ComplianceTagContainerExpanded from './ComplianceTagContainerExpanded';
import ComplianceTagContainerCollapsed from './ComplianceTagContainerCollapsed';
import { IComponentProps as ComplianceTagInterface } from '../ComplianceTag/ComplianceTag';

function index({
    complianceTagList,
    hasError,
}: {
    complianceTagList: Array<ComplianceTagInterface>;
    hasError?: boolean;
}) {
    React.useEffect(() => {
        hasError ? setIsExpanded(true) : setIsExpanded(false);
    }, []);
    const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

    const onClick = () => setIsExpanded(!isExpanded);

    return isExpanded ? (
        <ComplianceTagContainerExpanded onClick={onClick} complianceTagList={complianceTagList} />
    ) : (
        <ComplianceTagContainerCollapsed onClick={onClick} />
    );
}

export default index;
