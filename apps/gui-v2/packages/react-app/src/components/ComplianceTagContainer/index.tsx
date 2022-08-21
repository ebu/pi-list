import React from 'react';
import ComplianceTagContainerExpanded from './ComplianceTagContainerExpanded';
import ComplianceTagContainerCollapsed from './ComplianceTagContainerCollapsed';
import { ComplianceTagInterface } from '../ComplianceTag/ComplianceTag';

function index({
    complianceTagList,
    hasError,
}: {
    complianceTagList: Array<ComplianceTagInterface>;
    hasError: boolean;
}) {
    const [hadErrors, setHadErrors] = React.useState<boolean>(hasError);
    const [isUserExpanded, setIsUserExpanded] = React.useState<boolean>(false);
    const isOpen = isUserExpanded || hadErrors;

    React.useEffect(() => {
        setHadErrors(hasError);
    }, [hasError]);

    const onClick = React.useCallback(() => {
        console.log('Click!', isOpen, isUserExpanded, hadErrors);
        // Even if it had errors, close it if the user asks so
        if (hadErrors) {
            setHadErrors(() => false);
        }

        setIsUserExpanded(!isOpen);
    }, [isUserExpanded, hadErrors, isOpen, setHadErrors, setIsUserExpanded]);

    return isOpen ? (
        <ComplianceTagContainerExpanded onClick={onClick} complianceTagList={complianceTagList} />
    ) : (
        <ComplianceTagContainerCollapsed onClick={onClick} />
    );
}

export default index;
