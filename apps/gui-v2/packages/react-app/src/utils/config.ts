function loadFile(filePath: string): string {
    let result: string = "{}";
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.open('GET', filePath, false);
    xmlhttp.send();
    if (xmlhttp.status === 200) {
        result = xmlhttp.responseText;
    }

    return result;
}

let staticConfig: any = null;

export function getStaticConfig() {
    try {
        if (!staticConfig){
            staticConfig = JSON.parse(loadFile("/static.config.json"));
        }
        return staticConfig;
    }
    catch {
        return {};
    }
}

export function hasLiveMode() {
    // env var overrides static config
    if (typeof process.env.REACT_APP_LIVE_MODE !== 'undefined') {
        return process.env.REACT_APP_LIVE_MODE === 'true';
    } else {
        const config = getStaticConfig();
        if (typeof config.liveMode !== 'undefined') {
            return config.liveMode === 'true';
        }
    }
    return false;
}
