const commander = require('commander');
const yamlParser = require('read-yaml');
const deepFreeze = require('deep-freeze');
const path = require('./path');

function parseNmosArguments(arguments) {
    if(!arguments.nmos) {
        return null;
    }

    return arguments.nmos;
}

function parseArguments(arguments) {
    const nmosArguments = parseNmosArguments(arguments);

    const config = Object.assign({}, arguments, {
        port: arguments.port || '3030',
        folder: path.sanitizeDirectoryPath(arguments.folder),
        cpp: path.sanitizeDirectoryPath(arguments.cpp),
        influxURL: `http://${arguments.influx.hostname}:${arguments.influx.port}`,
        databaseURL: `mongodb://${arguments.database.hostname}:${arguments.database.port}`,
        nmos: nmosArguments,
        developmentMode: arguments.dev || false,
        liveMode: arguments.liveMode || arguments.live || false
    });

    const webappDomain = process.env.EBU_LIST_WEB_APP_DOMAIN || config.webappDomain;
    config.webappDomain = webappDomain || 'http://localhost:8080';
    console.log('config.webappDomain:', config.webappDomain);

    const liveModeEnv = (process.env.EBU_LIST_LIVE_MODE !== undefined) && (process.env.EBU_LIST_LIVE_MODE === 'true');
    config.liveMode = liveModeEnv || config.liveMode;
    console.log('config.liveMode:', config.liveMode);

    return config;
}

commander
    .arguments('<configFile>')
    .option('--dev', 'Development mode')
    .option('--live', 'Live mode')
    .action((configFile, options) => {
        config = yamlParser.sync(configFile);
        config = Object.assign(config, yamlParser.sync("version.yml"));
        config.dev = options.dev;
        config.live = options.live;
    })
    .parse(process.argv);

if(typeof config === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

const arguments = parseArguments(config);
module.exports = deepFreeze(arguments);
