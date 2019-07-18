import _ from 'lodash';
import Actions from './Actions';

const getResolution = source => {
    const frame_width = _.get(source, [
        'nmos',
        'sender',
        'flow',
        'frame_width',
    ]);
    const frame_height = _.get(source, [
        'nmos',
        'sender',
        'flow',
        'frame_height',
    ]);
    const interlace_mode = _.get(source, [
        'nmos',
        'sender',
        'flow',
        'interlace_mode',
    ]);

    if (
        frame_width === undefined ||
        frame_height === undefined ||
        interlace_mode === undefined
    )
        return '';

    const isInterlaced = interlace_mode === 'interlaced_tff'; // TODO: other alternatives
    const interlacedTag = isInterlaced ? 'i' : 'p';

    return `${frame_width}x${frame_height}${interlacedTag}`;
};

const getNetInfo = s => {
    const sdp = _.get(s, 'sdp');
    const sdpStreams = _.get(sdp, 'streams');
    if (sdpStreams === undefined) return { source: '', destination: '' };

    // TODO: deal with dual streams
    const data = sdpStreams[0];

    const source = data.srcAddr;
    const destination = `${data.dstAddr}:${data.dstPort}`;

    return { source, destination };
};

const mapBackendData = source => {
    return {
        ...source,
        meta: {
            format: _.get(source, ['nmos', 'sender', 'flow', 'format']),
            network: getNetInfo(source),
        },
        media_specific: {
            resolution: getResolution(source)
        }
    };
};

const reducer = (state, { type, payload }) => {
    switch (type) {
        case Actions.setSources:
            return { ...state, data: payload.sources };

        case Actions.updateSources: {
            const { added, removedIds } = payload;
            const removedIdsSet = new Set(removedIds);
            const notRemoved = state.data.filter(s => !removedIdsSet.has(s.id));
            const sources = [...notRemoved, ...added.map(mapBackendData)];

            return { ...state, data: sources };
        }

        default:
            return state;
    }
};

export { reducer };
