import { events as eventTypes } from './types';

function* zipOrdered(writes, reads) {
    const wIt = writes[Symbol.iterator]();
    const rIt = reads[Symbol.iterator]();

    let r = null;
    let w = null;
    while (true) {
        if (r === null) {
            const v = rIt.next();
            if (!v.done) {
                r = v.value;
            }
        }

        if (w === null) {
            const v = wIt.next();
            if (!v.done) {
                w = v.value;
            }
        }

        if (r === null && w === null) return;

        if (r !== null && (w === null || r.ts < w.ts)) {
            yield { ...r, kind: eventTypes.read };
            r = null;
            continue;
        }

        if (w !== null) {
            yield { ...w, kind: eventTypes.write };
            w = null;
        }
    }
}

export function* analyze(packets, reads) {
    let vrx = 0;
    for (const event of zipOrdered(packets, reads)) {
        if (event.kind === eventTypes.read) {
            vrx -= 1;
        } else {
            vrx += 1;
        }

        yield { ts: event.ts, vrx: vrx };
    }
}
