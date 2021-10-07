import { LIST, types, api } from '@bisect/ebu-list-sdk';
import { Unwinder } from '@bisect/bisect-core-ts';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import { v1 as uuid } from 'uuid';
import expect from 'expect';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import { profiles } from '../profiles';

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

addTest(`Validate profile list"`, async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await list.login(c.settings.username, c.settings.password);
        const response: types.IAnalysisProfiles = await list.analysisProfile.getInfo();
        expect(response).not.toBeNull();
        expect(Array.isArray(response.all)).toBe(true);
        expect(response.all.length).toBe(3);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error verifying profile list: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
});

interface IProfileTestInfo {
    profileId: string;
    profileLabel: string;
    pcap: string;
    expectedError: string;
}

const profileTests: IProfileTestInfo[] = [
    {
        profileId: profiles[0].id, // JT-NM, pcap time
        profileLabel: profiles[0].label,
        pcap: 'audio_jitter_pt125us',
        expectedError: 'errors.audio_rtp_ts_not_compliant',
    },
    {
        profileId: profiles[2].id, // PCAP, pcap time
        profileLabel: profiles[2].label,
        pcap: 'audio_jitter_pt125us',
        expectedError: '',
    },
];

profileTests.forEach((test) => {
    addTest(`Test audio profile "${test.profileLabel}"`, async (c: testUtils.ITestContext) =>
        runTestAudioProfile(c, test)
    );
});

const runTestAudioProfile = async (c: testUtils.ITestContext, test: IProfileTestInfo) => {
    const list = new LIST(c.settings.address);
    const pcapDir = path.join(__dirname, '..', '..', 'pcaps');
    const name = test.pcap;
    const pcapFile = path.join(pcapDir, `${name}.pcap`);
    const pcapJsonFile = path.join(pcapDir, `${name}.json`);

    try {
        await list.login(c.settings.username, c.settings.password);

        await list.analysisProfile.setDefault(test.profileId);
        const response: types.IAnalysisProfiles = await list.analysisProfile.getInfo();
        expect(response).not.toBeNull();
        expect(_.isEqual(response.default, test.profileId)).toBe(true);

        const stream = fs.createReadStream(pcapFile);
        const callback = (info: types.IUploadProgressInfo) => console.log(`percentage: ${info.percentage}`);
        const pcapId = await doUpload(list, name, stream, callback);

        const testAnalysis = await list.pcap.downloadJson(pcapId);
        console.error(JSON.stringify(testAnalysis.data, null, 4));
        expect(_.isEqual(testAnalysis.data.analysis_profile.id, test.profileId)).toBe(true);

        const errors = testAnalysis.data.summary.error_list;
        if (test.expectedError == '') {
            expect(_.isEqual(errors.length, 0)).toBe(true);
        } else {
            expect(_.gt(errors.length, 0)).toBe(true);
            expect(_.isEqual(errors[0].value.id, test.expectedError)).toBe(true);
        }
        await list.pcap.delete(pcapId);
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error testing audio profile: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
};
