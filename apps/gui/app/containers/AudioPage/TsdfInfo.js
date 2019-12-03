import React from 'react';
import InfoPane from '../streamPage/components/InfoPane';
import ResultPane from '../streamPage/components/ResultPane';
import DataLine from '../streamPage/components/DataLine';
import { translateX } from 'utils/translation';

const TsdfInfo = props => {
    const analysis = props.streamInfo.global_audio_analysis.tsdf;
    const tsdf_max = analysis.max === null || analysis.max === undefined ? '---' : analysis.max;
    const invalid = analysis.result !== 'compliant';

    const summary = [
        {
            labelTag: 'stream.compliance',
            value:analysis.result,
            attention:invalid
        }
    ]

    const results = [
        {
            measurement: <DataLine
                label={translateX('media_information.audio.tsdf_max')}
                value={tsdf_max}
                units={analysis.unit}
                attention={invalid}
            />,
            limit: <DataLine
                label='maximum'
                value={analysis.limit}
                units={analysis.unit}
            />
        },
    ];

    return (
        <div>
            <InfoPane
                icon="queue_music"
                heading="TS-DF"
                values={summary}
            />
            <ResultPane
                values={results}
            />
        </div>
    );
};

export default TsdfInfo;
