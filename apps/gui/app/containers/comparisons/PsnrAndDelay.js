import React, { Component } from 'react';
import { translateX } from '../../utils/translation';
import chartFormatters from '../../utils/chartFormatters';
import LineChart from '../../components/LineChart';
import Panel from '../../components/common/Panel';
import InfoPane from '../streamPage/components/InfoPane';

const PsnrAndDelayPane = props => {
    const delay = props.result.delay;
    const psnr = props.result.psnr;
    const interlaced = props.config.media_specific.scan_type === 'interlaced';

    const summary = [
        {
            labelTag: 'comparison.result.max_psnr',
            value: psnr.max.psnr,
            units: 'dB',
        },
        {
            labelTag: 'comparison.result.delay.actual',
            value: (delay.actual / 1000).toFixed(3),
            units: 'ms',
        },
        {
            labelTag: 'comparison.result.delay.media',
            value: `${delay.sign == -1 ? '-' : '+'}${delay.frames}:${interlaced ? delay.fields+':' : ''}${delay.lines}:${delay.pixels}`,
            units: `frames : ${interlaced ? 'fields : ' : ''}lines : pixels`,
        },
        /* maybe unrelevant
        {
            labelTag: 'comparison.result.delay.rtp',
            value: delay.rtp,
            units: 'ticks',
        },
        */
        {
            labelTag: 'comparison.result.delay.rtp',
            value: (delay.rtp / 90).toFixed(3),
            units: 'ms',
        },
    ];

    const comment = `Main stream is ${
        delay.actual == 0? 'in sync with' : delay.actual < 0? 'earlier' : 'later'
    } than Reference stream.
       And content is ${ props.result.transparency? 'the same' : 'altered' }.`;

    return (
        <div>
            <InfoPane icon="bar_chart" headingTag="headings.psnr_and_delay" values={summary} comment={comment} />
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12">
                        <LineChart
                            asyncData={async () => {
                                return psnr.raw.map((e, i) => {
                                    return {
                                        value: e === 'inf' ? 100 : e,
                                        index: i - psnr.raw.length/2 + 1,
                                    };
                                });
                            }}
                            titleTag="comparison.result.psnr_vs_time_shift"
                            data={chartFormatters.singleValueLineChart}
                            xAxisMode="linear"
                            xAxis={chartFormatters.xAxisLinearDomain}
                            yAxisLabel={'PSNR (dB)'}
                            xAxisLabel={`Time (${interlaced? 'Fields' : 'Frames'})`}
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
