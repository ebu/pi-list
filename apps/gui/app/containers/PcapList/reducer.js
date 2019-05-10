import _ from 'lodash';
import immutable from '../../utils/immutable';
import Actions from './Actions';
import { translate } from '../../utils/translation';
import {
    getFullInfoFromId,
    addStateToPcapInfo,
    updatePcap
} from './utils';

const reducer = (state, action) => {
    console.table(action.type);
    switch (action.type) {
        case Actions.toggleRow: {
            const id = action.data.id;
            const newSelected = state.selected.filter(item => item !== id);

            if (newSelected.length === state.selected.length) {
                newSelected.push(id);
            }

            console.table(newSelected);

            return Object.assign({}, { ...state }, {
                selected: newSelected,
                selectAll: 2
            });
        }

        case Actions.toggleSelectAll: {
            let newSelected = [];

            if (state.selectAll === 0) {
                newSelected = state.data.map(item => item.id);
            }

            console.table(newSelected);

            return Object.assign({}, { ...state }, {
                selected: newSelected,
                selectAll: state.selectAll === 0 ? 1 : 0
            });
        }

        case Actions.clearSelection: {
            return Object.assign({}, { ...state }, {
                selected: [],
                selectAll: 0
            });
        }

        case Actions.selectBefore: {
            const id = action.data.id;
            const pcap = getFullInfoFromId(id, state.data);
            const baseDate = pcap.date;
            const newSelected = state.data.filter(item => item.date <= baseDate).map(item => item.id);

            return Object.assign({}, { ...state }, {
                selected: newSelected,
                selectAll: state.selectAll === 0 ? 1 : 0
            });
        }

        case Actions.selectAfter: {
            const id = action.data.id;
            const pcap = getFullInfoFromId(id, state.data);
            const baseDate = pcap.date;
            const newSelected = state.data.filter(item => item.date >= baseDate).map(item => item.id);

            return Object.assign({}, { ...state }, {
                selected: newSelected,
                selectAll: state.selectAll === 0 ? 1 : 0
            });
        }

        case Actions.pcapReceived: {
            const info = addStateToPcapInfo(action.data);

            // TODO: shouldn't translate here, only on display
            info.stateLabel = translate('workflow.reading_pcap');

            const newData = [info, ...state.data];

            const newState = Object.assign({}, { ...state }, {
                data: newData
            });

            return newState;
        }

        case Actions.pcapProcessed: {
            const newData = updatePcap(state.data, action.data, 'workflow.processing_streams');

            const newState = Object.assign({}, { ...state }, {
                data: newData
            });

            return newState;
        }

        case Actions.pcapFailed: {
            const newData = updatePcap(state.data, action.data, 'workflow.processing_streams');

            const newState = Object.assign({}, { ...state }, {
                data: newData
            });

            return newState;
        }

        case Actions.pcapDone: {
            const newData = updatePcap(state.data, action.data, 'workflow.done');

            const newState = Object.assign({}, { ...state }, {
                data: newData
            });

            return newState;
        }

        case Actions.pcapDeleted: {
            const id = action.data.id;
            const newData = immutable.findAndRemoveElementInArray({ id }, state.data);

            return Object.assign({}, { ...state }, {
                data: newData
            });
        }

        case Actions.requestDelete: {
            return Object.assign({}, { ...state }, {
                itemsToDelete: _.cloneDeep(action.data.ids)
            });
        }

        default:
            console.log(action.type, action.data);
            return state;
    }
};

export {
    reducer
};
