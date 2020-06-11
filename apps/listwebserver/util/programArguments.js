const commander = require('commander');
const yamlParser = require('read-yaml');
const deepFreeze = require('deep-freeze');
const path = require('path');
const pathSanitization = require('./path');
const { URL } = require('url');

function loadFile(filePath) {
    const fs = require('fs');
    const contents =  fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return contents;
  }

function parseNmosArguments(args) {
    return args.nmos || null;
}

function parseArguments(args) {
    const nmosArguments = parseNmosArguments(args);

    const config = Object.assign({}, args, {
        port: args.port || '3030',
        protocol: args.protocol || 'http',
        folder: pathSanitization.sanitizeDirectoryPath(args.folder),
        cpp: pathSanitization.sanitizeDirectoryPath(args.cpp),
        influxURL: `http://${args.influx.hostname}:${args.influx.port}`,
        databaseURL: `mongodb://${args.database.hostname}:${
            args.database.port
        }`,
        rabbitmqUrl: `amqp://${args.rabbitmq.hostname}:${args.rabbitmq.port}`,
        nmos: nmosArguments,
        developmentMode: args.dev || false,
        liveMode: args.liveMode || args.live || false,
    });

    // Environment variable
    if (process.env.EBU_LIST_WEB_APP_DOMAIN) {
        const baseUrl = new URL(process.env.EBU_LIST_WEB_APP_DOMAIN);
        config.apiUrl = `${baseUrl.protocol}//${baseUrl.host}/api`;
        config.webappDomain = `${baseUrl.protocol}//${baseUrl.host}`
    }
    else {
        try { // Docker will write a static.config.json with public web port
            const staticConfig = JSON.parse(loadFile('./../static.config.json'));
            if (!config.webappDomain){
                config.webappDomain = `${staticConfig.publicApiProtocol}://localhost:${staticConfig.publicApiPort}`
            }
            if (!config.apiUrl) {
                config.apiUrl = `${staticConfig.publicApiProtocol}://localhost:${staticConfig.publicApiPort}/api`;
            }
        }
        catch (err) {
            // Use the listwebserver port
            if (!config.webappDomain){
                config.webappDomain = `${config.protocol}://localhost:${config.port}`
                
            }
            if (!config.apiUrl) {
                config.apiUrl = `${config.protocol}://localhost:${config.port}/api`;
            }
        }
    }
    console.log('config.apiUrl:', config.apiUrl);

    const liveModeEnv =
        process.env.EBU_LIST_LIVE_MODE !== undefined &&
        process.env.EBU_LIST_LIVE_MODE === 'true';
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
