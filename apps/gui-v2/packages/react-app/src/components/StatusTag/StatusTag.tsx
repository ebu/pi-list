import React from 'react';
import './styles.scss';

interface IComponentProps {
  compliant: boolean;
}

function StatusTag({ status }: { status: IComponentProps }) {
  return (
    <div className={status.compliant ? 'status-tag-container compliant' : 'status-tag-container not-compliant'}>
      <div className="status-tag-information">
        <div className={status.compliant ? 'status-tag-dot compliant' : 'status-tag-dot not-compliant'}></div>
        <span className={status.compliant ? 'status-tag-text compliant' : 'status-tag-text not-compliant'}>
          {status.compliant ? 'Compliant' : 'Not Compliant'}
        </span>
      </div>
    </div>
  );
}

export default StatusTag;
