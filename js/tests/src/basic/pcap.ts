import { LIST, types } from '@bisect/ebu-list-sdk';
import { Unwinder } from '@bisect/bisect-core-ts';
import _ from 'lodash';
import { promises as fs1 } from 'fs';
import fs from 'fs';
import { v1 as uuid } from 'uuid';
import expect from 'expect';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Basic]);
import path from 'path';
import { loginOrRegister } from './auth';
var diff = require('deep-diff');
const tmp = require('temporary');

const resultHandler = function (err: NodeJS.ErrnoException | null) {
    if (err) {
        console.log('unlink failed', err);
    } else {
        console.log('file deleted');
    }
};

const uploadTestPcap = async (list: LIST, c: testUtils.ITestContext) => {
    const testPcaps = 'emb_L24_48k_16ch_pt125us';

    const pcapDir = path.join(__dirname, '..', '..', 'pcaps');
    const pcapFile = path.join(pcapDir, `${testPcaps}.pcap`);

    const unwinder = new Unwinder();
    try {
        const stream = fs.createReadStream(pcapFile);

        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
        const tmpFile = new tmp.File();
        const pcapId = await doUpload(list, testPcaps, stream, callback);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error uploading file: ${message}`);
        throw err;
    } finally {
        unwinder.unwind();
    }
};

const deleteTestPcap = async (list: LIST, c: testUtils.ITestContext) => {
    const allPcaps = await list.pcap.getAll();

    allPcaps.map(async (pcap) => {
        const unwinder = new Unwinder();

        try {
            await list.pcap.delete(pcap.id);
        } catch (err: unknown) {
            const { message } = err as Error;
            console.error(`Error Deleting file: ${message}`);
            throw err;
        } finally {
            unwinder.unwind();
        }
    });
};

const deleteJsonProperties = (jsonToParse: any) => {
    delete jsonToParse._id;
    delete jsonToParse.id;
    delete jsonToParse.owner_id;
    delete jsonToParse.capture_file_name;
    delete jsonToParse.date;
    delete jsonToParse.pcap_file_name;
    delete jsonToParse.analyzer_version;

    jsonToParse?.streams?.forEach((element: any) => {
        delete element._id;
        delete element.id;
        delete element.pcap;
    });

    jsonToParse?.summary?.error_list?.forEach((element: any) => {
        delete element.stream_id;
    });
    return jsonToParse;
};

export const doUpload = async (
    list: LIST,
    name: string,
    stream: fs.ReadStream,
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
            await list.pcap.upload(name, stream, callback, pcapId);
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

const runUploadTest = async (name: string, c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    const pcapDir = path.join(__dirname, '..', '..', 'pcaps');
    const pcapFile = path.join(pcapDir, name);
    const refAnalysisFile = path.join(pcapDir, `${name}.json`);

    // if (!_.isEqual(filteredRefAnalysis, filteredTestAnalysis)) {
    //     console.log(`Diff:  ${JSON.stringify(diff(filteredRefAnalysis, filteredTestAnalysis))}`);
    try {
        await loginOrRegister(list, c);

        const stream = fs.createReadStream(pcapFile);

        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
        const pcapId = await doUpload(list, name, stream, callback);

        const testAnalysis = await list.pcap.downloadJson(pcapId);

        const actualPath = await c.writeToFile('actual.json', JSON.stringify(testAnalysis.data));

        /* Update refAnalysisFile if necessary */
        // fs.writeFileSync(refAnalysisFile, JSON.stringify(testAnalysis.data, null, 4));

        const refAnalysis = fs.readFileSync(refAnalysisFile);
        const filteredRefAnalysis = deleteJsonProperties(JSON.parse(refAnalysis.toString()));
        const filteredTestAnalysis = deleteJsonProperties(_.cloneDeep(testAnalysis.data));

        const isEqual = _.isEqual(filteredRefAnalysis, filteredTestAnalysis);
        if (!isEqual) {
            const difference = JSON.stringify(diff(filteredRefAnalysis, filteredTestAnalysis));
            const differencePath = await c.writeToFile('difference.json', difference);

            console.log(
                `Different contents. Actual file: file:///${actualPath}. Difference: file:///${differencePath}`
            );
        }
        expect(isEqual).toBe(true);
        await list.pcap.delete(pcapId);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error uploading file: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
};

[
    'mac_address.pcap.gz', // This stream contains packets send to the same IP multicast address but with 
                           // different MAC addresses.
    '2vid_2aud.pcap.gz',
    '4k_50fps.pcap',
    'eemebe_t_1080i59.pcap',
    'emb_L24_48k_16ch_pt125us.pcap',
    'Newcapture-20210419-154617.pcap',
    'ttmlRTP_fourPacketDocs.pcap',
    'ttmlRTP_singlePacketDocs.pcap',
    'ttmlRTP-invalid-clock-timing.pcap',
].forEach((name) => {
    addTest(`Pcap: upload pcap "${name}"`, async (c: testUtils.ITestContext) => runUploadTest(name, c));
});

addTest('Pcap: get all', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);
        await uploadTestPcap(list, c);

        const response = await list.pcap.getAll();
        expect(response).not.toBeNull();
        expect(typeof response[0].id).toBe('string');
        expect(typeof response[0].analyzed).toBe('boolean');
        expect(typeof response[0].capture_date).toBe('number');

        await deleteTestPcap(list, c);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error getting all Pcaps:${message}`);
        throw err;
    } finally {
        await list.close();
    }
});

addTest('Pcap: get info', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);
        await uploadTestPcap(list, c);

        const getAllPcaps = await list.pcap.getAll();
        const pcapIdInfo = await list.pcap.getInfo(getAllPcaps[0].id);
        expect(pcapIdInfo).not.toBeNull();
        expect(typeof pcapIdInfo.id).toBe('string');
        expect(typeof pcapIdInfo.analyzed).toBe('boolean');
        expect(typeof pcapIdInfo.capture_date).toBe('number');

        await deleteTestPcap(list, c);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error getting Pcap info:${message}`);
        throw err;
    } finally {
        await list.close();
    }
});

addTest('Pcap: download', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    const unwinder = new Unwinder();

    try {
        await loginOrRegister(list, c);
        await uploadTestPcap(list, c);

        const tmpFile = new tmp.File();

        const getAllPcaps = await list.pcap.getAll();
        const pcapId = getAllPcaps[0].id;
        const downloadPcap = await list.pcap.downloadPcap(pcapId);
        fs.writeFileSync(tmpFile.path, downloadPcap.data);
        const fileInfo = await fs1.stat(tmpFile.path);
        const minimumFileSize = 1000;
        unwinder.add(() => fs.unlink(tmpFile.path, resultHandler));

        expect(fileInfo.size).toBeGreaterThan(minimumFileSize);

        await deleteTestPcap(list, c);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error downloading Pcap: ${message}`);
        throw err;
    } finally {
        unwinder.unwind();
        await list.close();
    }
});

addTest('Pcap: download Sdp', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    const unwinder = new Unwinder();

    try {
        await loginOrRegister(list, c);

        await uploadTestPcap(list, c);
        const tmpFile = new tmp.File();

        const getAllPcaps = await list.pcap.getAll();
        const pcapId = getAllPcaps[0].id;
        const downloadPcap = await list.pcap.downloadSdp(pcapId);
        fs.writeFileSync(tmpFile.path, downloadPcap.data);
        const fileInfo = await fs1.stat(tmpFile.path);
        const minimumFileSize = 10;
        unwinder.add(() => fs.unlink(tmpFile.path, resultHandler));

        expect(fileInfo.size).toBeGreaterThan(minimumFileSize);
        await deleteTestPcap(list, c);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error downloading Pcap sdp: ${message}`);
        throw err;
    } finally {
        unwinder.unwind();
        await list.close();
    }
});

addTest('Pcap: get streams', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);

        await uploadTestPcap(list, c);

        const download = await list.pcap.getAll();
        const pcapId = download[0].id;
        const getStreams = await list.pcap.getStreams(pcapId);

        expect(getStreams).not.toBeNull();
        await deleteTestPcap(list, c);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error getting streams: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
});
