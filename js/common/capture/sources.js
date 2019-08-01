/*
    source: { 
        id: 'ec8bd040-8b6e-11e9-a800-8564b7e25089',

        kind: string (see kinds),

        meta: {
            label: <textual>,
            format: string (see formats),

            /// if format is video
            video: {
                resolution: <string eg 1920x1080i50>
            }
            ///
        },

        sdp: {
            data: <SDP text>,
            streams: [ { 
                dstAddr: '239.20.112.1',
                dstPort: 50020,
                srcAddr: '192.168.8.34' 
            } ] 
        }

        /// if kind === 'nmos'
        nmos: { 
            sender: <NMOS sender>,
        },
        ///
    }
*/

const kinds = {
    nmos: 'nmos',
    user_defined: 'user_defined',
    from_sdp: 'from_sdp',
};

const formats = {
    video: 'urn:x-nmos:format:video',
    audio: 'urn:x-nmos:format:audio',
    data: 'urn:x-nmos:format:data',
};

module.exports = {
    kinds,
    formats
};
