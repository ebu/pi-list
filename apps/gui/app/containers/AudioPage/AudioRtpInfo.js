import React from 'react';
import InfoPane from '../streamPage/components/InfoPane';
import MinMaxDisplay from '../streamPage/components/MinMaxDisplay';

const AudioRtpInfo = props => {
    const analysis = props.streamInfo.global_audio_analysis;

    const rtp_ts_vs_pkt_ts_range =
        analysis.packet_ts_vs_rtp_ts.range === null ||
        analysis.packet_ts_vs_rtp_ts.range === undefined
            ? '---'
            : analysis.packet_ts_vs_rtp_ts.range;
    const rtp_ts_vs_pkt_ts_limit = analysis.packet_ts_vs_rtp_ts.limit;
    const rtp_ts_vs_pkt_ts_msg =
        rtp_ts_vs_pkt_ts_range.min < rtp_ts_vs_pkt_ts_limit.min ||
        rtp_ts_vs_pkt_ts_range.max > rtp_ts_vs_pkt_ts_limit.max
            ? `out of range [${rtp_ts_vs_pkt_ts_limit.min}, ${
                  rtp_ts_vs_pkt_ts_limit.max
              }]`
            : '';

    return (
        <div>
            <InfoPane icon="blur_linear" heading="RTP" values={[]} />
            <MinMaxDisplay
                labelTag="media_information.rtp.delta_packet_time_vs_rtp_time_ns"
                min={rtp_ts_vs_pkt_ts_range.min}
                max={rtp_ts_vs_pkt_ts_range.max}
                units="μs"
                message={rtp_ts_vs_pkt_ts_msg}
            />
        </div>
    );
};

export default AudioRtpInfo;
