import Actions from './Actions';
import api from '../../utils/api';
import notifications from '../../utils/notifications';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';

const middleware = (state, action) => {
    console.log(`Action: ${action.type}, ${JSON.stringify(action.payload)}`);
    switch (action.type) {
        case Actions.captureFromSources:
            const workflowInfo = {
                type: workflowTypes.captureAndIngest,
                configuration: {
                    ids: action.payload.ids,
                    filename: action.payload.filename,
                    durationMs: action.payload.durationMs,
                },
            };

            api.createWorkflow(workflowInfo)
                .then(() => {
                    // notifications.success({
                    //     titleTag: 'workflow.requested',
                    //     messageTag: 'workflow.requested',
                    // });
                })
                .catch(() => {
                    notifications.error({
                        titleTag: 'workflow.request_failed',
                        messageTag: 'workflow.request_failed',
                    });
                });
            break;

        default:
            break;
    }
};

export { middleware };
