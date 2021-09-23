import { LIST } from '@bisect/ebu-list-sdk';
import { testUtils } from '@bisect/bisect-core-ts-be';
import { addTest as add, requirements } from '../repo';
import { List } from 'lodash';
const expect = require('expect');
const addTest = (name: string, test: testUtils.TestFunction) => add(name, test, [requirements.Basic]);

export const loginOrRegister = async (list: LIST, c: testUtils.ITestContext) => {
    try {
        const result = await list.login(c.settings.username, c.settings.password);
        await expect(result).not.toBeNull();
    } catch (err: unknown) {
        await list.user.create(c.settings.username, c.settings.password);
        const login = await list.login(c.settings.username, c.settings.password);
        await expect(login).not.toBeNull();
    }
};

addTest('Login: ok', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);
    } finally {
        await list.close();
    }
});

addTest('Login: invalid host', async (c: testUtils.ITestContext) => {
    const list = new LIST('https://localhost:12345');

    try {
        await list.login(c.settings.username, c.settings.password);
    } catch (err) {
        return;
    } finally {
        await list.close();
    }
    throw new Error('Expected exception');
});

addTest('Login: invalid user', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);
    try {
        await list.login('invalid user', c.settings.password);
    } catch (err) {
        return;
    } finally {
        await list.close();
    }
    throw new Error('Expected exception');
});

addTest('Login: invalid pass', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);
    try {
        await list.login(c.settings.username, 'invalid pass');
    } catch (err) {
        return;
    } finally {
        await list.close();
    }
    throw new Error('Expected exception');
});

addTest('Logout: ok', async (c: testUtils.ITestContext) => {
    const list = new LIST(c.settings.address);

    try {
        await loginOrRegister(list, c);
        const result = list.logout();
        expect(result).not.toBeNull();
    } catch (err: unknown) {
        const { message } = err as Error;
        console.error(`Error logging in/out: ${message}`);
        throw err;
    } finally {
        await list.close();
    }
});
