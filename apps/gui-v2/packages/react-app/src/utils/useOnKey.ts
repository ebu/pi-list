import { useEffect } from 'react';
import keyEnum from '../enums/keyEnum';

export const useOnKey = (keycode: any, callback: () => void) => {
    const onKeyUp = (event: { key: any }) => {
        if (event.key === keycode) {
            callback();
        }
    };

    useEffect(() => {
        document.addEventListener(keyEnum.KEY_UP, onKeyUp);
        return () => {
            document.removeEventListener(keyEnum.KEY_UP, onKeyUp);
        };
    });
};

export const useOnEscape = (onEscape: () => void) => {
    useOnKey(keyEnum.ESC, onEscape);
};

export const useOnEnter = (callback: () => void) => {
    useOnKey(keyEnum.ENTER, callback);
};

export const useOnEnterAndEsc = (enterCallback: any, escCallback: any) => {
    useOnEnter(enterCallback);
    useOnEscape(escCallback);
};
