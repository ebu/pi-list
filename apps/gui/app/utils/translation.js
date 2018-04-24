import Polyglot from 'node-polyglot';
import phrases from 'language/en-US.json';

const polyglot = new Polyglot({ locale: 'en', phrases });

const polyglotTranslayte = polyglot.t.bind(polyglot);

export function translate(item, obj = null) {
    return polyglotTranslayte(item, obj);
}

export function pluralize(item, itemCount) {
    if (Number.isInteger(itemCount)) {
        return polyglotTranslayte(item, itemCount);
    }

    throw new Error('In order to use the pluralize function you need to send an integer in itemCount');
}
