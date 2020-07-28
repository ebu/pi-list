import React, { Component } from 'react';
import Panel from '../components/common/Panel';
import api from '../utils/api';
import chartFormatters from '../utils/chartFormatters';
import Chart from '../components/StyledChart';
import Graphs from '../components/graphs';
import { values } from 'lodash';

const PtpPage = props => {
    const { pcapID } = props.match.params;

    return (
        <Panel className="col-xs-12">
            <div className="row">
                <div className="col-xs-12">
                    <Chart
                        type="line"
                        request={() => api.getPtpOffset(pcapID)}
                        labels={chartFormatters.getTimeLineLabel}
                        formatData={chartFormatters.singleValueChart}
                        xLabel=""
                        title="PTP Offset"
                        height={300}
                        yLabel="ns"
                        point_radius="5"
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <Graphs.Line
                        title="PTP offset"
                        xTitle="Time (TAI)"
                        yTitle="Offset (ns)"
                        asyncGetter={async () => {
                            const value = await api.getPtpOffset(pcapID);
                            console.dir(value)
                            return value;
                        }}
                        layoutProperties={{ yaxis: { tickformat: ',d' } }}
                    />
                </div>
            </div>
        </Panel>
    );
};

export default PtpPage;
