export function* take(n, iter) {
    let index = 0;
    for (const val of iter) {
        if (index >= n) {
            return;
        }
        index += 1;
        yield val;
    }
}

export const numbers = function*(start) {
    let i = start;
    while (true) {
        yield i++;
    }
};

export class Lazy {
    constructor(iterable, callback) {
        this.iterable = iterable;
        this.callback = callback;
    }

    filter(callback) {
        return new LazyFilter(this, callback);
    }

    map(callback) {
        return new LazyMap(this, callback);
    }

    next() {
        return this.iterable.next();
    }

    take(n) {
        const values = [];
        for (let i = 0; i < n; i++) {
            values.push(this.next().value);
        }

        return values;
    }
}

class LazyFilter extends Lazy {
    next() {
        while (true) {
            const item = this.iterable.next();

            if (this.callback(item.value)) {
                return item;
            }
        }
    }
}

class LazyMap extends Lazy {
    next() {
        const item = this.iterable.next();

        const mappedValue = this.callback(item.value);
        return { value: mappedValue, done: item.done };
    }
}

export const iota = start => new Lazy(numbers(start || 0));

export const gaussian = (mean, stddev) => {
    return function() {
        let V1;
        let V2;
        let S;
        do {
            const U1 = Math.random();
            const U2 = Math.random();
            V1 = 2 * U1 - 1;
            V2 = 2 * U2 - 1;
            S = V1 * V1 + V2 * V2;
        } while (S >= 1);
        if (S === 0) return 0;
        return mean + stddev * (V1 * Math.sqrt((-2 * Math.log(S)) / S));
    };
}
