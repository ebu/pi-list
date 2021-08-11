import { translate } from '../../../../utils/translation';
import { LineGraphic } from 'components/index';
import { getLeftMargin } from '../../../../utils/graphs/dataTransformationLineGraphs';

function PsnrAndDelayView({ comparisonInfo }: any) {
    const delay = comparisonInfo.result.delay;
    const psnr = comparisonInfo.result.psnr;
    const interlaced = comparisonInfo.config.media_specific.scan_type === 'interlaced';
    const xAxisTitle = `Time (${interlaced ? 'Fields' : 'Frames'})`;

    const comment = `Main stream is ${
        delay.actual == 0 ? 'in sync with' : delay.actual < 0 ? 'earlier' : 'later'
    } than Reference stream.
       And content is ${comparisonInfo.result.transparency ? 'the same' : 'altered'}.`;

    const graphicDataParsed = psnr.raw.map((e: any, i: any) => {
        return {
            value: e === 'inf' ? 100 : e,
            time: i - psnr.raw.length / 2 + 1,
        };
    });

    const leftMarginGraphic = getLeftMargin(graphicDataParsed);

    const graphicData = {
        graphicData: graphicDataParsed,
        title: translate('comparison.result.psnr_vs_time_shift'),
        xAxisTitle: xAxisTitle,
        yAxisTitle: 'PSNR (dB)',
        datakeyY: 'value',
        datakeyX: 'time',
        leftMargin: leftMarginGraphic,
    };

    return (
        <div>
            <span className="comparison-configuration-panel-title padding-to-title">
                {translate('headings.psnr_and_delay')}
            </span>
            <div className="st20227-data-container">
                <span className="comparison-configuration-panel-data">{comment}</span>
                {/* <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${translate('comparison.result.max_psnr')}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{psnr.max.psnr.toFixed(3)}</span>
                    <span className="comparison-configuration-panel-data"> dB</span>
                </div> */}
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${translate('comparison.result.delay.actual')}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${(delay.actual / 1000).toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data"> ms</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${translate('comparison.result.delay.media')}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`
                        ${delay.sign == -1 ? '-' : '+'}${delay.frames}:${interlaced ? delay.fields + ':' : ''}${
                        delay.lines
                    }:${delay.pixels}
                    `}</span>
                    <span className="comparison-configuration-panel-data">
                        {' '}
                        {`frames : ${interlaced ? 'fields : ' : ''}lines : pixels`}
                    </span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-subtitle">
                        {`${translate('comparison.result.delay.rtp')}: `}
                    </span>
                    <span className="comparison-configuration-panel-data">{`${(delay.rtp / 90).toFixed(3)}`}</span>
                    <span className="comparison-configuration-panel-data"> ms</span>
                </div>
            </div>
            <LineGraphic data={graphicData} />
        </div>
    );
}

export default PsnrAndDelayView;
