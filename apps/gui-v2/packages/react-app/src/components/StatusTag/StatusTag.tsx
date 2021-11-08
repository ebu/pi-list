import React from 'react';
import './styles.scss';

interface IComponentProps {
    compliant: boolean;
}

function StatusTag({ status, unknown }: { status: IComponentProps; unknown?: number }) {
    const getStatusTag = () => {
        console.log('teste');
        if (unknown) {
            const isUnkown = unknown > 0 ? true : false;
            return (
                <>
                    <div className={'status-tag-dot unknown'}></div>
                    <span className={'status-tag-text unknown'}>Unknown</span>
                </>
            );
        }
    };

    return (
        <div className={status.compliant ? 'status-tag-container compliant' : 'status-tag-container not-compliant'}>
            <div className="status-tag-information">
                {unknown ? (
                    getStatusTag()
                ) : (
                    <>
                        <div
                            className={status.compliant ? 'status-tag-dot compliant' : 'status-tag-dot not-compliant'}
                        ></div>
                        <span
                            className={status.compliant ? 'status-tag-text compliant' : 'status-tag-text not-compliant'}
                        >
                            {status.compliant ? 'Compliant' : 'Not Compliant'}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

export default StatusTag;
