import _ from 'lodash';
import actions from './actions';

const tableInitialState = () => ({
    data: [],
    selected: [],
    selectAll: 0,
    itemsToDelete: [],
});

const tableReducer = (state, action) => {
    switch (action.type) {
        case actions.toggleRow: {
            const id = action.data.id;
            const newSelected = state.selected.filter(item => item !== id);

            if (newSelected.length === state.selected.length) {
                newSelected.push(id);
            }

            return Object.assign({}, { ...state }, {
                selected: newSelected,
                selectAll: 2
            });
        }

        case actions.toggleSelectAll: {
            let newSelected = [];

            if (state.selectAll === 0) {
                newSelected = state.data.map(item => item.id);
            }

            return Object.assign({}, { ...state }, {
                selected: newSelected,
                selectAll: state.selectAll === 0 ? 1 : 0
            });
        }

        case actions.clearSelection: {
            return Object.assign({}, { ...state }, {
                selected: [],
                selectAll: 0
            });
        }

        case actions.requestDelete: {
            return Object.assign({}, { ...state }, {
                itemsToDelete: _.cloneDeep(action.data.ids)
            });
        }

        default:
            return state;
    };
};

export {
    tableInitialState,
    tableReducer
};
