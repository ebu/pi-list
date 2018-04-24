const commander = require('commander');
const yamlParser = require('read-yaml');
const deepFreeze = require('deep-freeze');
const path = require('../helpers/path');

function parseArguments(arguments) {
    return Object.assign({}, arguments, {
        port: arguments.port || '3030',
        folder: path.sanitizeDirectoryPath(arguments.folder),
        cpp: path.sanitizeDirectoryPath(arguments.cpp),
        influxURL: arguments.influx ? `http://${arguments.influx.hostname}:${arguments.influx.port}` : '',
        developmentMode: arguments.dev || false
    });
}

commander
    .arguments('<configFile>')
    .option('--dev', 'Development mode')
    .action((configFile, options) => {
        config = yamlParser.sync(configFile);
        config.dev = options.dev;
    })
    .parse(process.argv);

if(typeof config === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

const arguments = parseArguments(config);
module.exports = deepFreeze(arguments);
