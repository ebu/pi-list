import _ from 'lodash';
import Actions from './Actions';

const reducer = (state, { type, payload }) => {
    console.log(type);
    console.dir(payload);

    switch (type) {
        case Actions.updateWorkflows: {
            const added = payload.added || [];
            const updated = payload.updated || [];
            const removedIds = payload.removedIds || [];

            const removedIdsSet = new Set(removedIds);
            const updatedIdsSet = new Set(updated.map(wf => wf.id));
            const notRemoved = state.data.filter(s => !removedIdsSet.has(s.id));
            const notUpdated = notRemoved.filter(s => !updatedIdsSet.has(s.id));
            const items = [...notUpdated, ...added, ...updated];

            return { ...state, data: items };
        }

        default:
            return state;
    }
};

export { reducer };
