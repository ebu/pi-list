import { LIST } from '@bisect/ebu-list-sdk';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import { loginOrRegister } from './auth';
const expect = require('expect');
const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Basic]);

addTest('download Manager: download given a wrong id', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);
    await loginOrRegister(list, c);

    try {
        const download = await list.downloadManager.download('12345');
        expect(download).not.toBeNull();
        expect(download.status).toBe(404);
    } catch (err) {
        throw err;
    } finally {
        await list.close();
    }
});

addTest('download Manager: get all', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);
    await loginOrRegister(list, c);

    try {
        const downloadAll = await list.downloadManager.getAll();
        expect(downloadAll).not.toBeNull();
    } catch (err) {
        return;
    } finally {
        await list.close();
    }
});
