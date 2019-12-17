import _ from 'lodash';
import Actions from './Actions';
import { kinds, formats } from 'ebu_list_common/capture/sources';

const getNetInfo = s => {
    const invalidInfo = { source: 'not defined', destination: 'not defined' };

    const sdp = _.get(s, 'sdp');

    if (sdp === undefined) {
        return invalidInfo;
    }

    const sdpStreams = _.get(sdp, 'streams');
    if (sdpStreams === undefined || sdpStreams.length === 0) return invalidInfo;

    // TODO: deal with dual streams
    const data = sdpStreams[0];

    const source = data.srcAddr;
    const destination = `${data.dstAddr}:${data.dstPort}`;

    return { source, destination };
};

const getResolution = source => {
    if (source.meta.format === formats.video) {
        return _.get(source, ['meta', 'video', 'resolution']);
    }

    if (source.meta.format === formats.audio) {
        return _.get(source, ['meta', 'audio', 'resolution']);
    }

    return '';
};

const mapBackendData = source => {
    const resolution = getResolution(source);
    return {
        ...source,
        meta: {
            ...source.meta,
            network: getNetInfo(source),
        },
        media_specific: {
            resolution: getResolution(source),
        },
    };
};

const reducer = (state, { type, payload }) => {
    switch (type) {
        case Actions.setSources:
            return { ...state, data: payload.sources };

        case Actions.updateSources: {
            const { added, removedIds } = payload;
            const removedIdsSet = new Set(removedIds);
            const notRemoved = state.data.filter(s => !removedIdsSet.has(s.id) && s._id != added.map(p => p._id));
            const sources = [...notRemoved, ...added.map(mapBackendData)];

            return { ...state, data: sources };
        }

        case Actions.showAddSource:
            return { ...state, addSourceModalVisible: true };

        case Actions.hideAddSource:
            return { ...state, addSourceModalVisible: false };

        case Actions.addSources:
            return { ...state, addSourceModalVisible: false, editSourceModalVisible: false };

        case Actions.showEditSource:
            return { ...state, editSourceModalVisible: true };

        case Actions.hideEditSource:
            return { ...state, editSourceModalVisible: false };

        case Actions.showSDPErrorPopUp:
            const id = payload.id;
            const newSelected = state.data.filter(item => item.id === id);
            if (newSelected[0].sdp.errors != null && newSelected[0].sdp.errors.length > 0) {
                return Object.assign({}, { ...state}, {
                    showSDPErrorPopUp: { show: true, id: id, error: newSelected[0].sdp.errors.join(" and ") }
                });                
            }else {
                // { ...state, showSDPErrorPopUp: { show: false, id: null, error: ""} };
                return Object.assign({}, { ...state}, {
                    showSDPErrorPopUp: { show: false, id: null, error: ""}
                });                
            }
            
        case Actions.hideSDPErrorPopUp:
            return Object.assign({}, { ...state}, {
                showSDPErrorPopUp: { show: false, id: null, error: ""}
            });

        default:
            return state;
    }
};

export { reducer };
