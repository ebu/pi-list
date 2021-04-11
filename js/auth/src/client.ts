import decode from 'jwt-decode';

const tokenLocalStorageKey = 'ebu:bearer-token';
const tokenRevalidateAdvanceMs = 30000;

interface IDecodedToken {
    exp: number; // Expiration time in UNIX time (s)
    iat: number; // Issued time in UNIX time (s)
    id: string;
    username: string;
}

function isDecodedToken(v: IDecodedToken | unknown): v is IDecodedToken {
    return (v as IDecodedToken).iat !== undefined;
}

const decodeToken = (token: string): IDecodedToken | undefined => {
    try {
        const decoded = decode(token);
        if (isDecodedToken(decoded)) {
            return decoded;
        }
    } catch (err) {
        console.error(`Error decoding token: ${err}`);
        return undefined;
    }
};

interface ILocalStorageHandler {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => any | undefined;
    removeItem: (key: string) => void;
}

interface ILoginData {
    username: string;
    password: string;
}

interface ILoginResponse {
    success: boolean;
    token: string;
}

interface IGenericResponse<ContentType> {
    desc: string;
    result: number;
    content: ContentType;
}

export interface IApiHandler {
    login: (data: ILoginData) => Promise<IGenericResponse<ILoginResponse>>;
    revalidateToken: () => Promise<IGenericResponse<ILoginResponse>>;
}

export class Client {
    private apiHandler: IApiHandler;
    private storageHandler: ILocalStorageHandler;
    private tokenDiffTimeMs: number | undefined;
    private revalidateTimer: NodeJS.Timeout | null;

    constructor(apiHandler: IApiHandler, storageHandler: ILocalStorageHandler) {
        this.apiHandler = apiHandler;
        this.storageHandler = storageHandler;
        this.tokenDiffTimeMs = undefined;
        this.revalidateTimer = null;
    }

    public async login(username: string, password: string): Promise<void | Error> {
        try {
            const response = await this.apiHandler.login({ username, password });
            if (response && response.result <= 0 && response.content.success) {
                this.setToken(response.content.token);
            }

            return;
        } catch (err) {
            console.error(`Login error ${err}`);
            return err;
        }
    }

    public revalidate(): void {
        const token = this.getToken();
        if (token) {
            // If this is a browser refresh, try to revalidate the token
            this.handleRevalidateTimer();
        }
    }

    public logout() {
        this.storageHandler.removeItem(tokenLocalStorageKey);
    }

    public getToken(): string {
        const t = this.storageHandler.getItem(tokenLocalStorageKey);
        return t;
    }

    // Checks if token is valid
    public isAuthenticated(): boolean {
        const token = this.getToken();
        return token !== undefined;
    }

    public setToken(token: string): void {
        this.storageHandler.setItem(tokenLocalStorageKey, token);

        const decoded = decodeToken(token);
        if (decoded === undefined) {
            console.error('Invalid token');
            this.invalidateToken();
            return;
        }

        const expireInMs = (decoded.exp - decoded.iat) * 1000; // Convert to ms delta

        const revalidateTime = expireInMs > tokenRevalidateAdvanceMs ? expireInMs - tokenRevalidateAdvanceMs : 0;
        console.log(`Token expires in ${expireInMs}ms. Setting the timer to fire in ${revalidateTime}ms`);
        this.resetTimer(revalidateTime);
    }

    ////////////////////
    // Private

    private invalidateToken(): void {
        this.storageHandler.removeItem(tokenLocalStorageKey);
    }

    private resetTimer(deltaMs: number): void {
        if (this.revalidateTimer !== null) {
            clearTimeout(this.revalidateTimer);
            this.revalidateTimer = null;
        }

        setTimeout(() => this.handleRevalidateTimer(), deltaMs);
    }

    private async handleRevalidateTimer() {
        try {
            const response = await this.apiHandler.revalidateToken();
            if (response && response.result <= 0 && response.content.success) {
                this.setToken(response.content.token);
            }

            return;
        } catch (err) {
            console.error(`Token revalidation error ${err}`);
        }

        this.invalidateToken();
    }
}
