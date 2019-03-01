const commander = require('commander');
const yamlParser = require('read-yaml');
const deepFreeze = require('deep-freeze');
const path = require('./path');
const logger = require('./logger');

function parseNmosArguments(arguments) {
    if(!arguments.nmosRegistry) {
        return null;
    }

    return {
        url: `http://${arguments.nmosRegistry.hostname}:${arguments.nmosRegistry.port}`,
        refreshRate: parseFloat(arguments.nmosRegistry.refresh),
        version: arguments.nmosRegistry.version
    };
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
        liveMode: arguments.live || false
    });

    const webappDomain = process.env.EBU_LIST_WEB_APP_DOMAIN || config.webappDomain;
    config.webappDomain = webappDomain || 'http://localhost:8080';

    logger('static-generator').info('process.env.EBU_LIST_WEB_APP_DOMAIN:', process.env.EBU_LIST_WEB_APP_DOMAIN);
    logger('static-generator').info('arguments.webappDomain:', arguments.webappDomain);
    logger('static-generator').info('config.webappDomain:', config.webappDomain);

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
