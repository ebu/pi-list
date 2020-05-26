import { get_read_schedule } from './common';

export function* analyze(flowSettings, packets, reads) {
    const readSchedule = get_read_schedule(flowSettings);
    const trs = readSchedule.trs;

    const readIt = reads[Symbol.iterator]();

    let first = true;
    for (const packet of packets) {

        const next = readIt.next();
        if(next.done) return;

        const readTs = next.value.ts;
        const delta = readTs - packet.ts;

        const vrx = Math.ceil(delta / trs);

        yield { ts: packet.ts, vrx: vrx };
    }
}
