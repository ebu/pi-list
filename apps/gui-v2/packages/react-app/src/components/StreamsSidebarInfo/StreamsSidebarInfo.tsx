import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './styles.scss';
import { translate } from '../../utils/translation';

interface IStreamsTotalList {
    notCompliant: number;
    compliant: number;
}

interface IComponentProps {
    streamsTotalList: IStreamsTotalList;
    onViewAllDetailsButtonClick: (id: string) => void;
    currentPCapId: string | undefined;
}

function StreamsSidebarInfo({ streamsTotalList, onViewAllDetailsButtonClick, currentPCapId }: IComponentProps) {
    const total = streamsTotalList.notCompliant + streamsTotalList.compliant;
    const compliantPercentage = (streamsTotalList.compliant / total) * 100;

    return (
        <div>
            <span className="stream-sidebar-info-title">{translate('navigation.streams')}</span>
            <div className="stream-sidebar-info-content">
                <div className="stream-sidebar-info-svg">
                    <CircularProgressbar
                        value={compliantPercentage}
                        strokeWidth={10}
                        styles={buildStyles({
                            strokeLinecap: 'butt',
                            pathColor: '#0083FF',
                            textColor: 'white',
                            pathTransitionDuration: 0.5,
                            trailColor: '#BFE0FF',
                        })}
                    />
                </div>
                <div className="stream-sidebar-info-description">
                    <div>
                        <div>
                            <span className="stream-sidebar-info-total-dot"></span>
                            <span className="stream-sidebar-info-description-text">
                                {translate('workflow.st2022_7_analysis.totalNumberOfPackets')}
                            </span>
                        </div>
                        <div>
                            <span className="stream-sidebar-info-description-number">{total}</span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span className="stream-sidebar-info-compliant-dot"></span>
                            <span className="stream-sidebar-info-description-text">
                                {translate('pcap.state.compliant')}
                            </span>
                        </div>
                        <div>
                            <span className="stream-sidebar-info-description-number">{streamsTotalList.compliant}</span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span className="stream-sidebar-info-not-compliant-dot"></span>
                            <span className="stream-sidebar-info-description-text">
                                {translate('pcap.state.not_compliant')}
                            </span>
                        </div>
                        <div>
                            <span className="stream-sidebar-info-description-number">
                                {streamsTotalList.notCompliant}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="stream-sidebar-info-button">
                <button onClick={() => onViewAllDetailsButtonClick(currentPCapId ? currentPCapId : '')}>
                    View all details
                </button>
            </div>
        </div>
    );
}

export default StreamsSidebarInfo;
