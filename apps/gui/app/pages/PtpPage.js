import React, { Component } from 'react';
import Panel from 'components/common/Panel';
import api from 'utils/api';

import Graphs from 'components/graphs'
// TODO remove thata convert to Line.graph
import chartFormatters from 'utils/chartFormatters';
import Chart from 'components/StyledChart';
import { translateX } from 'utils/translation';

class PtpPage extends Component {
    render() {
        const { pcapID } = this.props.match.params;
        return (
            <Panel className="col-xs-12">
                <div className="row">
                    <div className="col-xs-12">
                        <Chart
                            type="line"
                            request={() => api.getPtpOffset(pcapID)}
                            labels={chartFormatters.getTimeLineLabel} //RS
                            formatData={chartFormatters.singleValueChart}
                            xLabel=""
                            title="PTP Offset"
                            height={300}
                            yLabel="ns"
                            point_radius="5"
                        />
                    </div>
                </div>
            </Panel>
        );
    }
}

export default PtpPage;
