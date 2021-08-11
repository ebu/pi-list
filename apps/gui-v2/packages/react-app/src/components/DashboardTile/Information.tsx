import React from 'react';

interface ComponentProps {
  props: Array<IInformation>;
}

function Information({ props }: ComponentProps) {
  return (
    <div className="dashboard-information">
      {props.map((item: IInformation) => (
        <div key={item.title}>
          <span className="dashboard-information-label">{item.number}</span>
          <span className="dashboard-information-title">{item.title}</span>
        </div>
      ))}
    </div>
  );
}

export interface IInformation {
  number: string;
  title: string;
}

export default Information;
