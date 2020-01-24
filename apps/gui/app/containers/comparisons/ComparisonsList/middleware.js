import Actions from './Actions';
import { translate } from '../../../utils/translation';
import api from '../../../utils/api';
import notifications from '../../../utils/notifications';

const middleware = (state, action) => {
    switch (action.type) {
        case Actions.deleteComparison: {
            const id = action.data.id;
            const name = action.data.name

            api.deleteComparison(id)
                .then(() => {
                    notifications.success({
                        title: translate('notifications.success.comparison_deleted'),
                        message: translate('notifications.success.comparison_deleted_message', { name: name })
                    });
                })
                .catch(() => {
                    notifications.error({
                        title: translate('notifications.error.comparison_deleted'),
                        message: translate('notifications.error.comparison_deleted_message', { name: name })
                    });
                });
        }
            break;

        default:
            break;
    }
};

export { middleware };
