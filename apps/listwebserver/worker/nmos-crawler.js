const axios = require('axios');
const logger = require('../util/logger');
const websocketManager = require('../managers/websocket');
const program = require('../util/programArguments');

const url = program.nmosRegistry;
const version = program.nmosVersion;
const query_url = `${url}/x-nmos/query/v${version}`;
const intervalToUpdate = program.nmosRegistryRefreshRate * 1000;

// todo: subscribe to NMOS updates via websockets /subscription API

const intervalObj = setInterval(() => {
    logger('nmos-crawler').info(`Checking registry for flows`);
    const query_all_flows_url = `${query_url}/flows`;

    axios.get(query_all_flows_url)
        .then(response => {
            const promises = response.data.map( flow => {
                return new Promise( (resolve, reject) => {
                    const source_url = `${query_url}/sources/${flow.source_id}`;
                    const device_id = `${query_url}/devices/${flow.device_id}`;

                    axios.all([axios.get(source_url), axios.get(device_id)])
                        .then(axios.spread((source, device) => {
                            flow.source = source.data;
                            flow.device = device.data;

                            resolve(flow);
                        }))
                        .catch(error => {
                            reject(error);
                        });
                });
            });
            //
            axios.all(promises)
                .then( data => {
                    // todo: save it on DB?
                    websocketManager.instance().sendEventToAllUsers({
                        event: 'NMOS_UPDATE',
                        data: data
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        })
        .catch(error => {
            console.log(error);
        });
}, intervalToUpdate);
