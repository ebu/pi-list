import React from 'react';
import './styles.scss';

interface IDetails {
    icon: ({ className }: { className?: string }) => JSX.Element;
    text: string;
    description: string;
}

function PCapDetails({ detailsList }: { detailsList: IDetails[] | null }) {
    return (
        <div className="pcap-details-container">
            <span className="pcap-details-title">Details</span>
            {detailsList === null
                ? null
                : detailsList.map((detail, index) => {
                      const Icon = detail.icon;
                      return (
                          <div className="pcap-details-lists" key={index}>
                              <div className="pcap-details-icon-text">
                                  <Icon className={'pcap-details-icon'} />
                                  <span className={`${detail.text === 'Truncated' ? 'details-text-warning' : ''}`}>
                                      {detail.text}
                                  </span>
                              </div>
                              <span className="pcap-details-description">{detail.description}</span>
                          </div>
                      );
                  })}
        </div>
    );
}

export default PCapDetails;
