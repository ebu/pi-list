import Actions from './Actions';

const reducer = (state, { type, payload }) => {
    switch (type) {
        case Actions.setDownloadMngr:
            return { ...state, data: payload.data };

        default:
            return state;
    }
};

export { reducer };
