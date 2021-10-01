import { LIST, types, api } from '@bisect/ebu-list-sdk';
import { Unwinder } from '@bisect/bisect-core-ts';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { v1 as uuid } from 'uuid';
import expect from 'expect';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
const constants = require('../../../../apps/listwebserver/enums/analysis');

const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Advanced]);
var diff = require('deep-diff');
const tmp = require('temporary');

const resultHandler = function (err: NodeJS.ErrnoException | null) {
    if (err) {
        console.log('unlink failed', err);
    } else {
        console.log('file deleted');
    }
};

const deleteJsonProperties = (json: any) => {
    const jsonToParse = _.cloneDeep(json);
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

const doUpload = async (
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
            const timeoutMs = 12000; // It may be necessary to increase timeout due to the size of the pcap file

            await list.pcap.upload(name, stream, callback, pcapId);
            const uploadAwaiter = list.pcap.makeUploadAwaiter(pcapId, timeoutMs);
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

const profiles = constants.profiles;

addTest(`Validate profile list"`, async (c: testUtils.ITestContext) => runProfileListing(profiles, c));

const runProfileListing = async (profiles: any, c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await list.login(c.settings.username, c.settings.password);
        const response: types.IAnalysisProfiles = await list.analysisProfile.getInfo();
        expect(response).not.toBeNull();
        expect(Array.isArray(response.all)).toBe(true);
        expect(response.all.length).toBeGreaterThan(0);
        expect(_.isEqual(response.all, profiles)).toBe(true);
    } catch (err: unknown) {
        const { message  } = err as Error;
        console.error(`Error verifying profile list: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
};

const profileTests = [
    {
        profile: profiles[0], // JT-NM, pcap time
        pcap: 'audio_jitter_pt125us',
        expectedError: 'errors.audio_rtp_ts_not_compliant'
    },
    {
        profile: profiles[2], // PCAP, pcap time
        pcap: 'audio_jitter_pt125us',
        expectedError: ''
    },
];

profileTests.forEach((test) => {
    addTest(`Test audio profile "${test.profile.label}"`,
            async (c: testUtils.ITestContext) => runTestAudioProfile(test, c))
});

const runTestAudioProfile = async (test: any, c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);
    const pcapDir = path.join(__dirname, '..', '..', 'pcaps');
    const name = test.pcap;
    const pcapFile = path.join(pcapDir, `${name}.pcap`);
    const pcapJsonFile = path.join(pcapDir, `${name}.json`);

    try {
        await list.login(c.settings.username, c.settings.password);
        await list.analysisProfile.setDefault(test.profile.id);
        const response: types.IAnalysisProfiles = await list.analysisProfile.getInfo();
        expect(response).not.toBeNull();
        expect(_.isEqual(response.default, test.profile.id)).toBe(true);

        const stream = fs.createReadStream(pcapFile);
        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
        const pcapId = await doUpload(list, name, stream, callback);

        const testAnalysis = await list.pcap.downloadJson(pcapId);
        console.error(JSON.stringify(testAnalysis.data, null , 4));
        expect(_.isEqual(testAnalysis.data.analysis_profile.id, test.profile.id)).toBe(true);

        const errors = testAnalysis.data.summary.error_list;
        if (test.expectedError == '') {
            expect(_.isEqual(errors.length, 0)).toBe(true);
        } else {
            expect(_.gt(errors.length, 0)).toBe(true);
            expect(_.isEqual(errors[0].value.id, test.expectedError)).toBe(true);
        }
        await list.pcap.delete(pcapId);
    } catch (err: unknown) {
        const { message  } = err as Error;
        console.error(`Error testing audio profile: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
};
