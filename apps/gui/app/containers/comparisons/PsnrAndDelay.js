import React, { Component } from 'react';
import { translateX } from '../../utils/translation';
import chartFormatters from '../../utils/chartFormatters';
import LineChart from '../../components/LineChart';
import Panel from '../../components/common/Panel';
import InfoPane from '../streamPage/components/InfoPane';

const PsnrAndDelayPane = (props) => {
    const max = props.result.max;
    const psnrList = props.result.psnr;

    const summary = [
        {
            labelTag: 'comparison.result.max_psnr',
            value: max.psnr,
            units: 'dB',
        },
        {
            labelTag: 'comparison.result.delta_sample',
            value: `${max.delta_index}:${max.lines}:${max.pixels}`,
            units: `${props.config.media_specific.scan_type === 'progressive'? 'frames' : 'fields'}:lines:pixels`
        },
        {
            labelTag: 'comparison.result.delta_pkt_ts',
            value: max.delta_first_pkt_ts/1000,
            units: 'us',
        },
        {
            labelTag: 'comparison.result.delta_rtp_ts',
            value: max.delta_rtp_ts,
            units: 'ticks',
        },
    ]

    const comment = `Main stream is ${
                max.delta_pkt_ts == 0? 'in sync with' :
                    max.delta_pkt_ts < 0? 'earlier' : 'later'
           } than Reference stream.
           And content is ${
               max.psnr === 'inf'? 'the same' : 'altered'
           }.`;

    return (
        <div>
            <InfoPane
                icon='bar_chart'
                headingTag='headings.psnr_and_delay'
                values={summary}
                comment={comment}
            />
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12">
                        <LineChart
                            asyncData={async () => {
                                return psnrList.map(e => {
                                    return {
                                        value: e.psnr === 'inf'? 100 : e.psnr,
                                        index: e.index - max.index
                                    };
                                });
                            }}
                            titleTag="comparison.result.psnr_vs_time_shift"
                            data={chartFormatters.singleValueLineChart}
                            xAxisMode='linear'
                            xAxis={chartFormatters.xAxisLinearDomain}
                            yAxisLabel={"PSNR (dB)"}
                            xAxisLabel={ translateX('comparison.result.delta_sample') }
                            height={300}
                            lineWidth={3}
                            legend
                        />
                    </div>
                </div>
            </Panel>
        </div>
    );
};

export default PsnrAndDelayPane;
