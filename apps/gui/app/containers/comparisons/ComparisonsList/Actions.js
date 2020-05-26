import tableActions from '../../../utils/models/table/actions';

const Actions = {
    ... tableActions,
    updateComparisons: 'updateWorkflows', // payload: <same as MQ event for topics.nmos.sender_list_update>
    deleteComparison: 'deleteComparison',
    comparisonDeleted: 'comparisonDeleted',
};

export default Actions;
