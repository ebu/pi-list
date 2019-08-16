const EventEmitter = require('events');
const axios = require('axios');
const _ = require('lodash');
const logger = require('../util/logger');
const W3CWebSocket = require('websocket').w3cwebsocket;

const events = {
    create: 'createEvent',
    delete: 'deleteEvent',
    update: 'updateEvent',
};

const createMonitor = query_url => {
    const eventEmitter = new EventEmitter();

    const handle_updates = updates => {
        updates.forEach(update => handle_update(update));
    };

    const handle_update = update => {
        const pre = update.pre;
        const post = update.post;

        if (!_.isNil(post) && _.isNil(pre)) {
            eventEmitter.emit(events.create, { post });
        } else if (_.isNil(post) && !_.isNil(pre)) {
            eventEmitter.emit(events.delete, { pre });
        } else if (!_.isNil(post) && !_.isNil(pre)) {
            eventEmitter.emit(events.update, { pre, post });
        }
    };
    ///////////////////////////////////////////////////

    const subscriptions_url = `${query_url}/subscriptions`;

    const subscription_body = {
        max_update_rate_ms: 100,
        resource_path: '/senders',
        params: {},
        persist: false,
        secure: false,
    };

    axios
        .post(subscriptions_url, subscription_body)
        .then(response => {
            const ws_href = _.get(response, ['data', 'ws_href']);

            if (_.isNil(ws_href)) {
                logger('nmos-crawler').error(
                    `Unexpected response from NMOS registry when subscribing to web socket: ${response}`
                );

                return;
            }

            logger('nmos-crawler').info(`WS href: ${ws_href}`);

            const client = new W3CWebSocket(ws_href, null);

            client.onerror = err => {
                logger('nmos-crawler').error(
                    `Error connecting to Websocket: ${err}`
                );
            };

            client.onopen = () => {
                logger('nmos-crawler').info('Connected to Websocket');
            };

            client.onclose = e => {
                logger('nmos-crawler').info('Connection to Websocket closed.');
            };

            client.onmessage = e => {
                if (
                    _.isNil(e) ||
                    _.isNil(e.data) ||
                    typeof e.data !== 'string'
                ) {
                    logger('nmos-crawler').error(
                        `Websocket received an Invalid message: ${e}`
                    );
                    return;
                }

                const event = JSON.parse(e.data);

                if (
                    _.isNil(event) ||
                    _.isNil(event.grain) ||
                    typeof event.grain !== 'object'
                ) {
                    logger('nmos-crawler').error(
                        `Websocket received an invalid event: ${event}`
                    );
                    return;
                }

                const updates = _.get(event, ['grain', 'data']);
                if (_.isNil(updates) || typeof updates !== 'object') {
                    logger('nmos-crawler').error(
                        `Websocket received an event with an invalid grain: ${event}`
                    );
                    return;
                }

                handle_updates(updates);
            };
        })
        .catch(err => {
            logger('nmos-crawler').error(
                `Could not contact the NMOS registry for subscribing to websockets: ${err}`
            );
        });

    ///////////////////////////////////////////////////

    return {
        eventEmitter,
    };
};

module.exports = {
    createMonitor,
    events
};
