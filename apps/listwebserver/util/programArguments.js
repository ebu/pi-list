const commander = require('commander');
const yamlParser = require('read-yaml');
const deepFreeze = require('deep-freeze');
const path = require('../helpers/path');

function parseArguments(arguments) {
    return Object.assign({}, arguments, {
        port: arguments.port || '3030',
        folder: path.sanitizeDirectoryPath(arguments.folder),
        cpp: path.sanitizeDirectoryPath(arguments.cpp),
        influxURL: `http://${arguments.influx.hostname}:${arguments.influx.port}`,
        databaseURL: `mongodb://${arguments.database.hostname}:${arguments.database.port}`,
        nmosRegistry: `http://${arguments.nmosRegistry.hostname}:${arguments.nmosRegistry.port}`,
        nmosRegistryRefreshRate: arguments.nmosRegistry.refresh,
        nmosVersion: arguments.nmosRegistry.version,
        developmentMode: arguments.dev || false,
        liveMode: arguments.live || false
    });
}

commander
    .arguments('<configFile>')
    .option('--dev', 'Development mode')
    .option('--live', 'Live mode')
    .action((configFile, options) => {
        config = yamlParser.sync(configFile);
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
