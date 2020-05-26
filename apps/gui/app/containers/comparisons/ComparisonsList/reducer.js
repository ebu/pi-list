import _ from 'lodash';
import Actions from './Actions';
import immutable from '../../../utils/immutable';

const reducer = (state, { type, payload }) => {
    switch (type) {
        case Actions.updateComparisons: {
            const added = payload.added || [];
            const updated = payload.updated || [];
            const removedIds = payload.removedIds || [];
            const items = [ ...added, ...updated];

            return { ...state, data: items };
        }

        case Actions.comparisonDeleted: {
            const id = payload.data.id;
            const newData = immutable.findAndRemoveElementInArray({ id }, state.data);

            return Object.assign({}, { ...state }, {
                data: newData
            });
        }

        default:
            return state;
    }
};

export { reducer };
