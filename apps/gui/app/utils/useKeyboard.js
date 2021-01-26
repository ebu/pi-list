import { useEffect } from 'react';
import keyEnum from '../enums/keyEnum';

export const useOnKey = (keycode, callback) => {
    const onKeyUp = event => {
        if (event.key === keycode) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener(keyEnum.EVENTS.KEY_UP, onKeyUp);
        return () => {
            document.removeEventListener(keyEnum.EVENTS.KEY_UP, onKeyUp);
        };
    });
};

export const useOnEscape = onEscape => {
    useOnKey(keyEnum.ESC, onEscape);
};

export const useOnEnter = callback => {
    useOnKey(keyEnum.ENTER, callback);
};

export const useOnEnterAndEsc = (enterCallback, escCallback) => {
    useOnEnter(enterCallback);
    useOnEscape(escCallback);
};
