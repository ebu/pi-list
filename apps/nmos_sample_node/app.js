const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const logger = require('./logger');
const uuid = require('uuid').v1;
const registration = require('./registration');
const staticData = require('./data/staticData');

const spdSingleVideo = fs.readFileSync(path.join(__dirname, 'data', 'single_video.sdp'), 'utf8');

const makeApp = (config) => {
    const app = express();

    const state = {
        node: staticData.node,
        device: staticData.device,
        source: staticData.source,
        flow: staticData.flow,
        makeSender: (state, senderId, sdpUrl) => {
            const sender = staticData.makeSender(senderId, sdpUrl);
            state.sender = sender;
            return sender;
        },
        baseUrl: undefined,
        sdps: {},
    };

    // Initialize the REST API logger
    app.use(morgan('short', { stream: logger('rest-api').restAPILogger }));

    //Helmet protects the express web servers from some well-known web vulnerabilities
    app.use(helmet());

    app.use(bodyParser.json());


    const init = (listeningUrl) => {
        const api = require('./api')(state);
        app.use('/api/', api);

        state.baseUrl = listeningUrl;

        const senderId = uuid();
        const sdpUrl = `${state.baseUrl}/api/sdp/${senderId}`;
        state.makeSender(state, senderId, sdpUrl);
        state.sdps[senderId] = spdSingleVideo;

        registration
            .registerNode(config.nmos.registrationUrl, state)
            .then(() => logger('server').info('Registration complete'))
            .catch(err => {
                logger('server').error('Error registering node');
                process.exit(-1);
            });

        const heartbeat = registration.makeHeartbeat(
            config.nmos.registrationUrl,
            state.node.data.id
        );

        setInterval(async () => {
            logger('server').info('Heartbeat');

            try {
                const response = await heartbeat();
            } catch (err) {
                logger('server').error(`Heartbeat failed`);
            }
        }, config.heartbeatPeriodMs);
    };

    const deinit = () => {
        registration
        .unregisterNode(config.nmos.registrationUrl, state)
        .then(() => {
            logger('server').info('Unregistration complete');
            process.exit(0);
        })
        .catch(err => {
            logger('server').error('Error unregistering node');
            process.exit(-1);
        });
    };

    return {
        self: app,
        init,
        deinit
    };
};

module.exports = makeApp;
