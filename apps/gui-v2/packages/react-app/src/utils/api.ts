import { LIST, types } from '@bisect/ebu-list-sdk';

class LocalStorageHandler implements types.ILocalStorageHandler {
    public setItem(key: string, value: string): void {
        localStorage.setItem(`list-${key}`, value);
    }

    public getItem(key: string): string | null {
        return localStorage.getItem(`list-${key}`);
    }

    public removeItem(key: string): void {
        localStorage.removeItem(`list-${key}`);
    }
}

const storageHandler = new LocalStorageHandler();
const list = new LIST(window.location.origin, {
    tokenStorage: storageHandler,
    handleUnauthorized: () => window.location.replace('/login'),
});

export default list;
