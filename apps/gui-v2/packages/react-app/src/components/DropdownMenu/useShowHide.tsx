import React, { useState } from 'react';

const blurTimerPeriod = 300; // If this is too small, the blur event causes the click on the option not to fire
const mouseOutTimerPeriod = 1500; // enough time to quickly get out and back in

export const useShowHide = (disabled: boolean | undefined, onChange: any) => {
    const [isOpen, _setIsOpen] = useState(false);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

    const clearTimer = () => {
        if (timer) {
            clearTimeout(timer);
            setTimer(null);
        }
    };

    const setIsOpen = () => {
        clearTimer();
        _setIsOpen(true);
    };

    const setIsClosed = () => {
        clearTimer();
        _setIsOpen(false);
    };

    const startTimer = (timerPeriod: any) => {
        clearTimer();
        const t = setTimeout(() => {
            setIsClosed();
        }, timerPeriod);
        setTimer(t);
    };

    const onItemClick = (v: any) => {
        setIsClosed();
        onChange(v);
    };

    const onClick = () => {
        // clearTimer();
        // if (!isOpen && !disabled) {
        //     setIsOpen();
        // } else {
        //     setIsClosed();
        // }
    };

    const onMouseOver = () => {
        if (!disabled) {
            setIsOpen();
        }
    };

    const onMouseOut = () => {
        startTimer(mouseOutTimerPeriod);
    };

    const onFocus = () => {
        if (!disabled) {
            setIsOpen();
        }
    };

    // Hack to prevent the blur event to cause the label not to be clicked
    const onBlur = () => {
        startTimer(blurTimerPeriod);
    };

    return {
        isOpen,
        onClick,
        onItemClick,
        onFocus,
        onBlur,
        onMouseOver,
        onMouseOut,
    };
};
