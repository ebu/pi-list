import React from 'react';
import Polyglot from 'node-polyglot';
import { useStateValue } from './AppContext';

const translations = {};
export const localeNames = require('../../data/locales.json');
export const locales = Object.keys(localeNames);

locales.forEach(lc => {
    // eslint-disable-next-line
    const phrases = require(`../../data/${lc}.json`);
    translations[lc] = new Polyglot({ lc, phrases });
});

export function translateTo(phrase, lc, value) {
    if (translations === undefined) {
        return 'Loading translations';
    }

    const t = translations[lc];
    if (!t) {
        return 'phrase';
    }

    return t.t(phrase, value) || phrase;
}

export const T = props => {
    const [{ language }] = useStateValue();
    return <span>{translateTo(props.t, language, props.v)}</span>;
};

export function translate(phrase, value) {
    return translateTo(phrase, 'en-US', value);
}

/// Returns a string. Can only be used in the context of a functional component
export function translateX(phrase, value) {
    const [{ language }] = useStateValue();
    return translateTo(phrase, language, value);
}

/// Returns a component that renders to a span.
export function translateC(phrase, value) {
    return <T t={phrase} v={value} />;
}
