import Actions from './Actions';
import moment from 'moment';
import api from '../../../utils/api';
import notifications from '../../../utils/notifications';
import { translate } from '../../../utils/translation';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';
import sources from 'ebu_list_common/capture/sources';
import uuidv1 from 'uuid/v1';

const middleware = (state, action) => {
    switch (action.type) {
        case Actions.deleteLiveSources:
            {
                const ids = action.payload.ids;

                api.deleteLiveSources(ids)
                    .then(() => {
                        notifications.success({
                            title: translate(
                                'notifications.success.live.sources.deleted'
                            ),
                            message: translate(
                                'notifications.success.live.sources.delete_message'
                            ),
                        });
                    })
                    .catch(() => {
                        notifications.error({
                            titleTag:
                                'notifications.error.live.sources.deleted',
                            messageTag:
                                'notifications.error.live.sources.delete_message',
                        });
                    });
            }
            break;

        case Actions.captureFromSources:
            const filename = moment(Date.now()).format('YYYYMMDD-hhmmss');

            const workflowInfo = {
                type: workflowTypes.captureAndIngest,
                configuration: {
                    ids: action.payload.ids,
                    filename: filename,
                },
            };

            api.createWorkflow(workflowInfo)
                .then(() => {
                    notifications.success({
                        titleTag: 'workflow.requested',
                        messageTag: 'workflow.requested',
                    });
                })
                .catch(() => {
                    notifications.error({
                        titleTag: 'workflow.request_failed',
                        messageTag: 'workflow.request_failed',
                    });
                });
            break;

        case Actions.addSources:
            const source = {
                id: uuidv1(),
                meta: {
                    label: 'User defined',
                },
                kind: sources.kinds.user_defined,
                sdp: {
                    streams: action.payload.sources,
                },
            };

            api.addLiveSource(source)
                .then(() => {
                    notifications.success({
                        titleTag: 'workflow.added',
                        messageTag: 'workflow.added',
                    });
                })
                .catch(() => {
                    notifications.error({
                        titleTag: 'workflow.add_failed',
                        messageTag: 'workflow.add_failed',
                    });
                });

            break;

        default:
            break;
    }
};

export { middleware };
