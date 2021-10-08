import { LIST } from '@bisect/ebu-list-sdk';
import expect from 'expect';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import { loginOrRegister } from './auth';
const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Basic]);

addTest('System info: get version', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);
        const response = await list.info.getVersion();
        expect(response).not.toBeNull();
        expect(typeof response.major).toBe('number');
        expect(typeof response.minor).toBe('number');
        expect(typeof response.patch).toBe('number');
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error getting version info: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
});
