import React, { Component } from 'react';
import { translateX } from '../../utils/translation';
import chartFormatters from '../../utils/chartFormatters';
import LineChart from '../../components/LineChart';
import Panel from '../../components/common/Panel';
import InfoPane from '../streamPage/components/InfoPane';

const CrossCorrelationPane = (props) => {
    const xcorr = props.result.xcorr;
    const delay = props.result.delay;
    const summary = [
        {
            labelTag: 'comparison.result.cross_correlation_max',
            value:  xcorr.max.toFixed(3),
            units: '/1',
        },
        {
            labelTag: 'comparison.result.delay.relative',
            value: delay.sample,
            units: 'samples',
        },
        {
            labelTag: 'comparison.result.delay.relative',
            value: (delay.time / 1000).toFixed(3),
            units: 'ms',
        },
        {
            labelTag: 'comparison.result.delay.capture',
            value: (delay.capture / 1000).toFixed(3),
            units: 'ms',
        },
        {
            labelTag: 'comparison.result.delay.actual',
            value: (delay.actual / 1000).toFixed(3),
            units: 'ms',
        },
    ]

    const comment = `Main stream is ${
                delay.actual == 0? 'in sync with' :
                    delay.actual < 0? 'earlier' : 'later'
           } than Reference stream.
           And content is ${
               props.result.transparency? 'the same' : 'altered'
           }.`;

    return (
        <div>
            <InfoPane
                icon='bar_chart'
                headingTag='headings.cross_correlation'
                values={summary}
                comment={comment}
            />
            <Panel className="lst-stream-info-tab">
                <div className="row lst-full-height">
                    <div className="col-xs-12">
                        <LineChart
                            asyncData={async () => xcorr.raw}
                            titleTag="comparison.result.cross_correlation"
                            data={chartFormatters.singleValueLineChart}
                            xAxisMode='linear'
                            xAxis={chartFormatters.xAxisLinearDomain}
                            yAxisLabel={"Cross Correlation"}
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

export default CrossCorrelationPane;
