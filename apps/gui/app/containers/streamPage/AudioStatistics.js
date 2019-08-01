import React from 'react';
import InfoPane from './components/InfoPane';

const AudioStatistics = props => {
    const tsdf_max = (props.analysis.tsdf.max === null || props.analysis.tsdf.max === undefined) ? '---' : props.analysis.tsdf.max;
    const tsdf_limit = props.analysis.tsdf.limit;
    const tsdf_msg = (tsdf_max > tsdf_limit)? `(out of range: > ${props.analysis.tsdf.limit})` : '';

    const rtp_ts_vs_pkt_ts_range = (props.analysis.rtp_ts_vs_pkt_ts.range === null || props.analysis.rtp_ts_vs_pkt_ts.range === undefined) ? '---' : props.analysis.rtp_ts_vs_pkt_ts.range;
    const rtp_ts_vs_pkt_ts_limit = props.analysis.rtp_ts_vs_pkt_ts.limit;
    const rtp_ts_vs_pkt_ts_msg = (rtp_ts_vs_pkt_ts_range.min < rtp_ts_vs_pkt_ts_limit.min || rtp_ts_vs_pkt_ts_range.max > rtp_ts_vs_pkt_ts_limit.max) ? `(out of range [${rtp_ts_vs_pkt_ts_limit.min}, ${rtp_ts_vs_pkt_ts_limit.max}])` : ''

    const values = [
        {
            labelTag: 'media_information.audio.number_samples',
            value: props.sample_count
        },
        {
            labelTag: 'media_information.audio.sample_size',
            value: props.sample_size,
            units: 'bytes'
        },
        {
            labelTag: 'media_information.audio.samples_per_packet',
            value: props.samples_per_packet
        },
        {
            labelTag: 'media_information.audio.tsdf_max',
            value: `${tsdf_max} ${tsdf_msg}`,
            units: 'μs'
        },
        {
            labelTag: 'media_information.audio.rtp_ts_vs_pkt_ts_range',
            value: `[${rtp_ts_vs_pkt_ts_range.min}, ${rtp_ts_vs_pkt_ts_range.max}] ${rtp_ts_vs_pkt_ts_msg}`,
            units: 'μs'
        }

    ];

    return (<InfoPane
        icon="queue_music"
        headingTag="headings.audio_measurements"
        values={values}
    />);
};

export default AudioStatistics;
