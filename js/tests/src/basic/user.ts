import { LIST } from '@bisect/ebu-list-sdk';
import expect from 'expect';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import { loginOrRegister } from './auth';
const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Basic]);

addTest('User: get info', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);
        const response = await list.user.getInfo();
        expect(response).not.toBeNull();
        expect(response.username).toBe(c.settings.username);
        expect(response.preferences.gui.language).toBe('en-US');
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error getting user info: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
});

/* GDPRwas removed from SDK
addTest('User: get GDPRS status', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await list.login(c.settings.username, c.settings.password);
        const response = await list.user.getGDPRStatus();
        expect(response).not.toBeNull();
    } catch (err) {
        console.error(`Error getting GDPRS status: ${err.toString()}`);
        throw err;
    } finally {
        await list.close();
    }
});
*/
