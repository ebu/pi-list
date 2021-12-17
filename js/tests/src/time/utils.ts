import { LIST, types } from '@bisect/ebu-list-sdk';
import { Unwinder } from '@bisect/bisect-core-ts';
import _ from 'lodash';
import { promises as fs1 } from 'fs';
import fs from 'fs';
import { v1 as uuid } from 'uuid';
import expect from 'expect';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import path from 'path';
import { loginOrRegister } from '../basic/auth';
// import { doUpload } from '../basic/pcap';
import { performance } from 'perf_hooks';
var diff = require('deep-diff');
const tmp = require('temporary');

const doUploadTimeTests = async (
    list: LIST,
    name: string,
    stream: fs.ReadStream,
    pcapFile: string,
    callback: types.UploadProgressCallback
): Promise<string> =>
    new Promise(async (resolve, reject) => {
        try {
            const wsClient = list.wsClient;
            if (wsClient === undefined) {
                reject(new Error('WebSocket client not connected'));
                return;
            }

            const pcapId = uuid();
            const timeoutMs = 300000; // It may be necessary to increase timeout due to the size of the pcap file

            const uploadAwaiter = list.pcap.makeUploadAwaiter(pcapId, timeoutMs);
            await list.pcap.uploadLocal(name, pcapFile, pcapId);
            const uploadResult = await uploadAwaiter;

            if (!uploadResult) {
                reject(new Error('Pcap processing undefined'));
                return;
            }

            console.log(`Awaiter: ${JSON.stringify(uploadResult)}`);

            if (pcapId !== uploadResult.id) {
                reject(new Error('Pcap id undefined'));
                return;
            }

            resolve(pcapId);
        } catch (err) {
            reject(err);
        }
    });

export const runUploadTimeTest = async (name: string, c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    const pcapDir = path.join('/home', 'nelsonsilva', '.list', 'performance_tests');
    const pcapFile = path.join(pcapDir, name);
    const logFile = path.join(pcapDir, 'duration_time_tests.txt');

    // if (!_.isEqual(filteredRefAnalysis, filteredTestAnalysis)) {
    //     console.log(`Diff:  ${JSON.stringify(diff(filteredRefAnalysis, filteredTestAnalysis))}`);
    try {
        await loginOrRegister(list, c);

        const stream = fs.createReadStream(pcapFile);

        const begin = performance.now();
        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
        const pcapId = await doUploadTimeTests(list, name, stream, pcapFile, callback);
        const end = performance.now();
        const duration = (end - begin) / 1000;
        const logTime = `Duration time for pcap ${name}: ${duration} seconds \r\n`;

        fs.appendFileSync(logFile, logTime);

        await list.pcap.delete(pcapId);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error uploading file: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
};
