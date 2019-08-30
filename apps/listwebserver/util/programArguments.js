const commander = require('commander');
const yamlParser = require('read-yaml');
const deepFreeze = require('deep-freeze');
const path = require('./path');
const { URL } = require('url');

function parseNmosArguments(args) {
    return args.nmos || null;
}

function parseArguments(args) {
    const nmosArguments = parseNmosArguments(args);

    const config = Object.assign({}, args, {
        port: args.port || '3030',
        folder: path.sanitizeDirectoryPath(args.folder),
        cpp: path.sanitizeDirectoryPath(args.cpp),
        influxURL: `http://${args.influx.hostname}:${args.influx.port}`,
        databaseURL: `mongodb://${args.database.hostname}:${
            args.database.port
        }`,
        rabbitmqUrl: `amqp://${args.rabbitmq.hostname}:${args.rabbitmq.port}`,
        nmos: nmosArguments,
        developmentMode: args.dev || false,
        liveMode: args.liveMode || args.live || false,
    });

    const webappDomain =
        process.env.EBU_LIST_WEB_APP_DOMAIN || config.webappDomain;
    config.webappDomain = webappDomain || 'http://localhost:8080';
    console.log('config.webappDomain:', config.webappDomain);

    const liveModeEnv =
        process.env.EBU_LIST_LIVE_MODE !== undefined &&
        process.env.EBU_LIST_LIVE_MODE === 'true';
    config.liveMode = liveModeEnv || config.liveMode;
    console.log('config.liveMode:', config.liveMode);

    const baseUrl = new URL(config.webappDomain);
    const apiUrl = `${baseUrl.protocol}//${baseUrl.hostname}:${config.port}/api`;
    config.apiUrl = apiUrl;

    return config;
}

commander
    .arguments('<configFile>')
    .option('--dev', 'Development mode')
    .option('--live', 'Live mode')
    .action((configFile, options) => {
        config = yamlParser.sync(configFile);
        config = Object.assign(config, yamlParser.sync('version.yml'));
        config.dev = options.dev;
        config.live = options.live;
    })
    .parse(process.argv);

if (typeof config === 'undefined') {
    console.error('no config file given!');
    process.exit(1);
}

const args = parseArguments(config);
module.exports = deepFreeze(args);
