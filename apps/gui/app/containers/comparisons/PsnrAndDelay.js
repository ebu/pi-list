import React, { Component } from 'react';
import { translateX } from '../../utils/translation';
import chartFormatters from '../../utils/chartFormatters';
import LineChart from '../../components/LineChart';
import Panel from '../../components/common/Panel';
import InfoPane from '../streamPage/components/InfoPane';

const PsnrAndDelayPane = props => {
    const delay = props.result.delay;
    const psnr = props.result.psnr;

    const summary = [
        {
            labelTag: 'comparison.result.max_psnr',
            value: psnr.max.psnr,
            units: 'dB',
        },
        {
            labelTag: 'comparison.result.delay.relative',
            value: `${delay.sample}:${delay.lines}:${delay.pixels}`,
            units: `${props.config.media_specific.scan_type === 'progressive' ? 'frames' : 'fields'}:lines:pixels`,
        },
        {
            labelTag: 'comparison.result.delay.relative',
            value: delay.actual / 1000000,
            units: 'ms',
        },
        {
            labelTag: 'comparison.result.delay.rtp',
            value: delay.rtp,
            units: 'ticks',
        },
    ];

    const comment = `Main stream is ${
        delay.sample == 0 ? 'in sync with' : delay.sample < 0 ? 'earlier' : 'later'
    } than Reference stream.
           And content is ${psnr.max.psnr === 'inf' ? 'the same' : 'altered'}.`;

    return (
        <div>
            <InfoPane icon="bar_chart" headingTag="headings.psnr_and_delay" values={summary} comment={comment} />
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12">
                        <LineChart
                            asyncData={async () => {
                                return psnr.raw.map(e => {
                                    return {
                                        value: e.psnr === 'inf' ? 100 : e.psnr,
                                        index: e.index - delay.sample,
                                    };
                                });
                            }}
                            titleTag="comparison.result.psnr_vs_time_shift"
                            data={chartFormatters.singleValueLineChart}
                            xAxisMode="linear"
                            xAxis={chartFormatters.xAxisLinearDomain}
                            yAxisLabel={'PSNR (dB)'}
                            xAxisLabel={translateX('comparison.result.delay.relative')}
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
