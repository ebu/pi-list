import { LIST, types, api } from '@bisect/ebu-list-sdk';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { v1 as uuid } from 'uuid';

const doUpload = async (
    list: LIST,
    stream: fs.ReadStream,
    callback: types.UploadProgressCallback,
    name: string
): Promise<string> =>
    new Promise(async (resolve, reject) => {
        try {
            const wsClient = list.wsClient;
            if (wsClient === undefined) {
                reject(new Error('WebSocket client not connected'));
                return;
            }

            let pcapId: string | undefined = uuid();
            const timeoutMs = 120000; // It may be necessary to increase timeout due to the size of the pcap file

            const upload = await list.pcap.upload(name, stream, callback);
            const uploadAwaiter = list.pcap.makeUploadAwaiter(upload.uuid, timeoutMs);
            const uploadResult = await uploadAwaiter;

            if (!uploadResult) {
                reject(new Error('Pcap processing undefined'));
                return;
            }

            console.log(`Awaiter: ${JSON.stringify(uploadResult)}`);

            pcapId = uploadResult.id;

            if (!pcapId) {
                reject(new Error('Pcap id undefined'));
                return;
            }

            resolve(pcapId);
        } catch (err) {
            reject(err);
        }
    });

const parser = yargs(process.argv.slice(2))
    .usage('Usage: $0 <command> [options]')
    .command('read-only-user', 'Run the create read-only user script.')
    .demandCommand(1, 1)
    .example('yarn run read-only-user -b http://localhost', 'Run the create read-only user script in http://localhost.')
    .alias('p', 'password')
    .nargs('p', 1)
    .describe('p', `The password`)
    .default('p', 'user')
    .alias('u', 'username')
    .nargs('u', 1)
    .describe('u', `The user`)
    .default('u', 'user')
    .help('h')
    .alias('h', 'help')
    .options({
        b: {
            type: 'string',
            alias: 'address',
            nargs: 1,
            describe: 'Name or IP address of the host',
        },
        u: { type: 'string' },
        p: { type: 'string' },
    })
    .demandOption('b')
    .wrap(120)
    .epilog('© 2021 MIPW Lda - All rights reserved');

const argv: {
    _: (string | number)[];
    [x: string]: unknown;
    b: string | undefined;
    p: string | undefined;
} = parser.argv;

const address = `${argv.b}`;
const username = argv.u as string;
const password = argv.p as string;

async function createReadOnlyUser(username: string, password: string, address: string): Promise<void> {
    const list = new LIST(address);

    const pcapDir = path.join(__dirname, '..', '..', 'tests', 'pcaps');
    const emb_L24_48k_16ch_pt125us = path.join(pcapDir, 'emb_L24_48k_16ch_pt125us.pcap');

    const twovid_2aud = path.join(pcapDir, '2vid_2aud.pcap.gz');
    const ttmlRTP_fourPacketDocs = path.join(pcapDir, 'ttmlRTP_fourPacketDocs.pcap');
    const ttmlRTP_singlePacketDocs = path.join(pcapDir, 'ttmlRTP_singlePacketDocs.pcap');
    const ttmlRTP_invalid_clock_timing = path.join(pcapDir, 'ttmlRTP-invalid-clock-timing.pcap');

    try {
        await list.user.create(username, password);
    } catch (e) {
        console.log(`Warning: User already exists`);
    }
    await list.login(username, password);

    const allPcaps = await list.pcap.getAll();

    if (allPcaps.length === 0) {
        const stream1 = fs.createReadStream(emb_L24_48k_16ch_pt125us);
        const stream2 = fs.createReadStream(twovid_2aud);
        const stream3 = fs.createReadStream(ttmlRTP_fourPacketDocs);
        const stream4 = fs.createReadStream(ttmlRTP_singlePacketDocs);
        const stream5 = fs.createReadStream(ttmlRTP_invalid_clock_timing);
        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
        await doUpload(list, stream1, callback, 'emb_L24_48k_16ch_pt125us');
        await doUpload(list, stream2, callback, '2vid_2aud');
        await doUpload(list, stream3, callback, 'ttmlRTP_fourPacketDocs');
        await doUpload(list, stream4, callback, 'ttmlRTP_singlePacketDocs');
        await doUpload(list, stream5, callback, 'ttmlRTP-invalid-clock-timing');
    }

    try {
        await list.user.updateUserReadOnly(true);
    } catch (e) {
        console.log(`Warning: User is alread read-only`);
        throw e;
    }
}

async function run(): Promise<void> {
    for (const arg of argv._) {
        if (arg === 'read-only-user') {
            try {
                await createReadOnlyUser(username, password, address);
                process.exit(0);
            } catch (e) {
                console.log(`Error: ${JSON.stringify(e)}`);
            }
        }
    }
}

run().catch((e) => {
    process.stderr.write(`Error: ${e} ${e.stack}\n`);
    process.exit(-1);
});
