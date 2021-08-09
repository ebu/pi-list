import Polyglot from 'node-polyglot';
import languages from '../data/locales.json';

export const localeNames: { [name: string]: string } = languages;
export const locales = Object.keys(localeNames);

// import phrases from '../data/en-US.json';
// const lc = 'en-US';
// const phrases = require(`../data/${lc}.json`);
// const translations: any = { 'en-US': new Polyglot({ locale: lc, phrases }) };

const getLanguage = () => 'en-US';

const translations: any = {};
locales.forEach((lc: string) => {
    // eslint-disable-next-line
    const phrases = require(`../data/${lc}.json`);
    translations[lc] = new Polyglot({ locale: lc, phrases });
});

export function translateTo(phrase: string, lc: string, value: any) {
    if (translations === undefined) {
        return 'Loading translations';
    }

    const t = translations[lc];
    if (!t) {
        return 'phrase';
    }

    return t.t(phrase, value) || phrase;
}

// export const T = props => {
//     return <span>{translateTo(props.t, getLanguage(), props.v)}</span>;
// };

export function translate(phrase: string, language?: string, value?: any) {
    if (!language) {
        return translateTo(phrase, getLanguage(), value);
    }
    return translateTo(phrase, language, value);
}
