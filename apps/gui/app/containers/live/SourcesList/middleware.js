import Actions from './Actions';
import api from '../../../utils/api';
import notifications from '../../../utils/notifications';
import { translate } from '../../../utils/translation';

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
                            title: translate(
                                'notifications.error.live.sources.deleted'
                            ),
                            message: translate(
                                'notifications.error.live.sources.delete_message'
                            ),
                        });
                    });
            }
            break;

        default:
            break;
    }
};

export { middleware };
