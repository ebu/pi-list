import Noty from 'noty';
import { translate } from './translation';
import 'noty/lib/noty.css';

Noty.overrideDefaults({
    layout: 'topRight',
    theme: 'list',
    timeout: 4000,
    closeWith: ['click', 'button'],
    progressBar: false,
    animation: {
        open: 'lst-animated fade-in-right',
        close: 'lst-animated fade-out-right',
    },
});

function notificationTemplate(title = '', message = '', icon) {
    return `
    <div class="row middle-xs lst-no-margin">
        <div class="list-noty-icon-wrapper">
            <i class="lst-icons lst-noty-icon">${icon}</i>
        </div>
        <div class="col-xs-9 lst-no-padding">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
    </div>`;
}

function showNoty(type, title, message, icon) {
    const noty = new Noty({
        type,
        text: notificationTemplate(title, message, icon),
        layout: 'bottomRight',
    });

    noty.show();
}

const getTitle = obj => obj.title || translate(obj.titleTag);
const getMessage = obj => obj.message || translate(obj.messageTag);

export default {
    success: obj => {
        showNoty('success', getTitle(obj), getMessage(obj), 'check_circle');
    },

    error: obj => {
        showNoty('error', getTitle(obj), getMessage(obj), 'error');
    },

    warn: obj => {
        showNoty('warn', getTitle(obj), getMessage(obj), 'warning');
    },
};
