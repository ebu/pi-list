import React from 'react';
import Timecode from 'smpte-timecode';
import { translateX, translateC } from '../../utils/translation';
import InfoPane from './components/InfoPane';

const getTimeCode = props => {
    try {
        return new Timecode(props.frame_count, Math.ceil(parseFloat(props.rate)), false).toString();
    } catch (e) {
        return '00:00:00:00';
    }
};

const getPackingMode = props => {
    switch (props.packing_mode) {
        case 1:
            return 'General Packing Mode (GPM)';
        case 2:
            return 'Block Packing Mode (BPM)';
        default:
            return 'Unknown';
    }
};

/* VideoInfo can serve as AncillaryInfo too */
const VideoInfo = props => {
    const isAncillary = typeof props.width === 'undefined';
    const size = `${props.width}x${props.height}`;
    const isInterlaced = props.scan_type === 'interlaced';
    const rate = typeof props.rate === 'string' ? props.rate : props.rate.toFixed(2).toString();
    const values = isAncillary
        ? [
              {
                  labelTag: 'media_information.rtp.wrong_marker_bit',
                  value: props.wrong_marker_count,
                  attention: props.wrong_marker_count > 0,
              },
              {
                  labelTag: 'media_information.ancillary.wrong_field_bits',
                  value: props.wrong_field_count,
                  attention: props.wrong_field_count > 0,
              },
              {
                  labelTag: 'media_information.ancillary.wrong_payloads',
                  value: props.payload_error_count,
                  attention: props.payload_error_count > 0,
              },
          ]
        : [
              {
                  labelTag: 'media_information.video.dimensions',
                  value: size,
              },
              {
                  labelTag: 'media_information.video.sampling',
                  value: props.sampling,
              },
              {
                  labelTag: 'media_information.video.color_depth',
                  value: props.color_depth,
                  units: 'bit',
              },
              {
                  labelTag: 'media_information.video.packets_per_frame',
                  value: props.packets_per_frame,
              },
              {
                  labelTag: 'media_information.video.continuation_bit',
                  value: props.has_continuation_bit_set
                      ? translateX('media_information.video.continuation_bit.present')
                      : translateX('media_information.video.continuation_bit.not_present'),
              },
              {
                  labelTag: 'media_information.video.packing_mode',
                  value: getPackingMode(props),
              },
          ];

    const allValues = values.concat([
        {
            labelTag: 'media_information.video.scan_type',
            value: translateX(
                isInterlaced ? 'media_information.video.interlaced' : 'media_information.video.progressive'
            ),
        },
        {
            labelTag: props.is_interlaced ? 'media_information.video.field_rate' : 'media_information.video.frame_rate',
            value: rate,
            units: 'Hz',
        },
        {
            labelTag: 'media_information.media_duration',
            value: getTimeCode(props),
        },
        {
            labelTag: props.is_interlaced ? 'media_information.video.fields' : 'media_information.video.frames',
            value: props.frame_count,
        },
    ]);

    return <InfoPane icon="ondemand_video" headingTag="headings.media_information" values={allValues} />;
};

export default VideoInfo;
