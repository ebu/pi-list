import { translate } from '../../../../utils/translation';
import { LineGraphic } from 'components/index';
import { getLeftMargin } from '../../../../utils/graphs/dataTransformationLineGraphs';

function CrossCorrelationView({ comparisonInfo }: any) {
    const xcorr = comparisonInfo.result.xcorr;
    const delay = comparisonInfo.result.delay;

    const comment = `Main stream is ${
        delay.actual == 0 ? 'in sync with' : delay.actual < 0 ? 'earlier' : 'later'
    } than Reference stream.
   And content is ${comparisonInfo.result.transparency ? 'the same' : 'altered'}.`;

    const graphicDataParsed = xcorr.raw.map((e: any, i: any) => {
        return {
            value: e,
            XCorr: xcorr.index + i,
        };
    });

    const leftMarginGraphic = getLeftMargin(graphicDataParsed);

    const graphicData = {
        graphicData: graphicDataParsed,
        title: translate('comparison.result.cross_correlation'),
        xAxisTitle: translate('comparison.result.delay.relative'),
        yAxisTitle: 'X-corr',
        datakeyY: 'value',
        datakeyX: 'XCorr',
        leftMargin: leftMarginGraphic,
    };

    return (
        <div>
            <span className="comparison-configuration-panel-title padding-to-title">
                {translate('headings.cross_correlation')}
            </span>
            <div className="st20227-data-container">
                <span className="comparison-configuration-panel-data">{comment}</span>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${translate('comparison.result.cross_correlation_max')}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${xcorr.max.toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data"> /1</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${translate('comparison.result.delay.actual')}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${(delay.actual / 1000).toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data"> ms</span>
                </div>
            </div>
            <LineGraphic data={graphicData} />
        </div>
    );
}

export default CrossCorrelationView;
