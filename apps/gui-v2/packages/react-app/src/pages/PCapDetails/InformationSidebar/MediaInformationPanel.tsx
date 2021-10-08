import React from 'react';
import { MediaInformation } from 'components/index';
import SDK from '@bisect/ebu-list-sdk';
import Timecode from 'smpte-timecode';
import { translate } from '../../../utils/translation';
import { Information } from 'types/information';

const audioInformationList = (
    currentStream: SDK.types.IStreamInfo,
    mediaInfo: SDK.api.pcap.IST2110AudioInfo
): Array<Information> => [
    {
        titleTag: 'media_information.audio.sampling',
        value: mediaInfo.sampling,
    },
    {
        titleTag: 'media_information.audio.encoding',
        value: mediaInfo.encoding,
    },
    {
        titleTag: 'media_information.audio.number_channels',
        value: mediaInfo.number_channels.toString(),
    },
    {
        titleTag: 'media_information.audio.packet_time',
        value: parseFloat(mediaInfo.packet_time).toFixed(3),
    },
    {
        titleTag: 'media_information.audio.number_samples',
        value: (currentStream?.statistics?.sample_count || 0).toString(),
    },
    {
        titleTag: 'media_information.audio.samples_per_packet',
        value: (currentStream.statistics.samples_per_packet || 0).toString(),
    },
    {
        titleTag: 'media_information.audio.packet_size',
        value: (currentStream?.statistics?.packet_size || 0).toString(),
    },
];

const getPackingMode = (props: number) => {
    switch (props) {
        case 1:
            return 'General Packing Mode (GPM)';
        case 2:
            return 'Block Packing Mode (BPM)';
        default:
            return 'Unknown';
    }
};

const getTimeCode = (frameCount?: number, rate?: number) => {
    if (!rate) return null;
    const mathFloor = Math.ceil(rate) as 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60;

    try {
        return new Timecode(frameCount, mathFloor, false).toString();
    } catch (e) {
        return '00:00:00:00';
    }
};

const videoInformationList = (
    currentStream: SDK.types.IStreamInfo,
    mediaInfo: SDK.api.pcap.IST2110VideoInfo
): Array<Information> => {
    const isInterlaced = mediaInfo.scan_type === 'interlaced';
    return [
        {
            titleTag: 'media_information.video.dimensions',
            value: `${mediaInfo.width}x${mediaInfo.height}`,
        },
        {
            titleTag: 'media_information.video.sampling',
            value: mediaInfo.sampling,
        },
        {
            titleTag: 'media_information.video.color_depth',
            value: mediaInfo.color_depth.toString(),
        },
        {
            titleTag: isInterlaced
                ? 'media_information.video.packets_per_field'
                : 'media_information.video.packets_per_frame',
            value: mediaInfo.packets_per_frame.toString(),
        },
        {
            titleTag: 'media_information.video.continuation_bit',
            valueTag: mediaInfo.has_continuation_bit_set
                ? 'media_information.video.continuation_bit.present'
                : 'media_information.video.continuation_bit.not_present',
        },
        {
            titleTag: 'media_information.video.packing_mode',
            value: getPackingMode(mediaInfo.packing_mode),
        },
        {
            titleTag: 'media_information.video.scan_type',
            valueTag: isInterlaced ? 'media_information.video.interlaced' : 'media_information.video.progressive',
        },
        {
            titleTag: currentStream.statistics.is_interlaced
                ? 'media_information.video.field_rate'
                : 'media_information.video.frame_rate',
            value: mediaInfo.rate,
        },
        {
            titleTag: 'media_information.media_duration',
            value: getTimeCode(currentStream?.statistics?.frame_count, currentStream?.statistics?.rate),
        },
        {
            titleTag: currentStream.statistics.is_interlaced
                ? 'media_information.video.fields'
                : 'media_information.video.frames',
            value: currentStream?.statistics?.frame_count?.toString(),
        },
    ];
};

const getRateAnc = (rate: string): number => {
    let finalRate = undefined;
    switch (rate) {
        case '60000/1001':
            return (finalRate = 59.94);
        case '30000/1001':
            return (finalRate = 29.97);
        case '24000/1001':
            return (finalRate = 23.976);
        default:
            return parseFloat(rate);
    }
};

const ancillaryInformationList = (
    currentStream: SDK.types.IStreamInfo,
    mediaInfo: SDK.api.pcap.IST2110AncInfo
): Array<Information> => {
    const isInterlaced = mediaInfo.scan_type === 'interlaced';

    const rate = getRateAnc(mediaInfo.rate);

    return [
        {
            titleTag: 'media_information.rtp.wrong_marker_bit',
            value: (currentStream?.statistics?.wrong_marker_count || 0).toString(),
        },
        {
            titleTag: 'media_information.ancillary.wrong_field_bits',
            value: (currentStream?.statistics?.wrong_field_count || 0).toString(),
        },
        {
            titleTag: 'media_information.ancillary.wrong_payloads',
            value: (currentStream.statistics.payload_error_count || 0).toString(),
        },
        {
            titleTag: 'media_information.video.scan_type',
            valueTag: isInterlaced ? 'media_information.video.interlaced' : 'media_information.video.progressive',
        },
        {
            titleTag: currentStream.statistics.is_interlaced
                ? 'media_information.video.field_rate'
                : 'media_information.video.frame_rate',
            value: mediaInfo.rate,
        },
        {
            titleTag: 'media_information.media_duration',
            value: getTimeCode(currentStream?.statistics?.frame_count, rate),
        },
        {
            titleTag: currentStream.statistics.is_interlaced
                ? 'media_information.video.fields'
                : 'media_information.video.frames',
            value: currentStream?.statistics?.frame_count?.toString(),
        },
    ];
};

const ttmlInformationList = (currentStream: any, mediaInfo: any): Array<Information> => {
    return [
        {
            titleTag: 'ttml.number_of_subtitles',
            value: (currentStream?.media_specific?.data?.length || '').toString(),
        },
        {
            titleTag: 'ttml.time_base',
            value: (currentStream?.media_specific?.data[0]?.timeBase || 'null').toString(),
        },
        {
            titleTag: 'ttml.sequence_identifier',
            value: (currentStream?.media_specific?.data[0]?.sequenceIdentifier || 'null').toString(),
        },
    ];
};

const MediaInformationPanel = ({ stream }: { stream: SDK.types.IStreamInfo | undefined }) => {
    const headingsMediaInfo = translate('headings.media_information');

    if (stream === undefined) return null;
    if (stream.media_specific === undefined) return null;

    switch (stream.media_type) {
        case 'video':
            const video_media_information = stream.media_specific as SDK.api.pcap.IST2110VideoInfo;
            return (
                <MediaInformation
                    informationStreamsList={videoInformationList(stream, video_media_information)}
                    title={headingsMediaInfo}
                />
            );
        case 'audio':
            const audio_media_information = stream.media_specific as SDK.api.pcap.IST2110AudioInfo;
            return (
                <MediaInformation
                    informationStreamsList={audioInformationList(stream, audio_media_information)}
                    title={headingsMediaInfo}
                />
            );
        case 'ancillary_data':
            const ancillary_media_information = stream.media_specific as SDK.api.pcap.IST2110AncInfo;
            return (
                <MediaInformation
                    informationStreamsList={ancillaryInformationList(stream, ancillary_media_information)}
                    title={headingsMediaInfo}
                />
            );
        case 'ttml':
            const ttml_media_information = stream.media_specific as SDK.api.pcap.IST2110AncInfo;
            return (
                <MediaInformation
                    informationStreamsList={ttmlInformationList(stream, ttml_media_information)}
                    title={headingsMediaInfo}
                />
            );
        default:
            return null;
    }
};

export default MediaInformationPanel;
