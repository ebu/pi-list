import React from 'react';
import './styles.scss'

function ComplianceTag({tagInformation}: {tagInformation: IComponentProps}) {
        
    let colorControl = () => {
        if(tagInformation.compliant){
            return "compliance-tag-compliant"
        }    
        else{
            return "compliance-tag-not-compliant"
        }
    }

    return (
        <div className={colorControl()}>
            <span>
                {tagInformation.text}
            </span>
        </div>
    );
}

export interface IComponentProps {
    compliant: boolean
    text: string
}

export default ComplianceTag;