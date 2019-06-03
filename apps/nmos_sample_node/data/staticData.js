const node = {
    type: 'node',
    data: {
        description: 'A mock node (LIST)',
        tags: {},
        href: 'http://10.0.2.15/',
        interfaces: [
            {
                port_id: '08-00-27-40-ac-52',
                name: 'eth1',
                chassis_id: null,
            },
            {
                port_id: '08-00-27-ee-87-c4',
                name: 'eth0',
                chassis_id: null,
            },
        ],
        hostname: 'node',
        label: 'List mock node',
        clocks: [
            {
                ref_type: 'internal',
                name: 'clk0',
            },
        ],
        api: {
            endpoints: [
                {
                    host: '10.0.2.15',
                    protocol: 'http',
                    port: 80,
                },
            ],
            versions: ['v1.0', 'v1.1', 'v1.2', 'v1.3'],
        },
        version: '1559295049:955881216',
        services: [
            {
                href: 'http://10.0.2.15/x-nmos/connection/v1.1/',
                type: 'urn:x-ipstudio:service:connection/v1.1',
            },
            {
                href: 'http://10.0.2.15/x-ipstudio/mdnsbridge/v1.0/',
                type: 'urn:x-ipstudio:service:mdnsbridge/v1.0',
            },
        ],
        caps: {},
        id: 'a6b8cdd2-aaaa-11e9-a7de-080027ee87c4',
    },
};

const device = {
    type: 'device',
    data: {
        description: 'A mock device (LIST)',
        tags: {},
        receivers: [],
        controls: [
            {
                href: 'http://10.0.2.15/x-nmos/connection/v1.0/',
                type: 'urn:x-nmos:control:sr-ctrl/v1.0',
            },
            {
                href: 'http://10.0.2.15/x-nmos/connection/v1.1/',
                type: 'urn:x-nmos:control:sr-ctrl/v1.1',
            },
        ],
        label: 'List mock device',
        version: '1559316061:587577088',
        senders: [
            'b020cd85-06af-4712-8a51-643de45b54a1',
            '63301a5c-ec7f-4139-8891-c0db6069d550',
            'ae95f41c-0c7e-45f7-87a6-5e8f262391e4',
            '5d2cc722-f211-4196-925b-96fbd96f1068',
        ],
        type: 'urn:x-nmos:device:generic',
        id: 'cf03921e-bbbb-4136-a7b9-82e17714dd03',
        node_id: node.data.id,
    },
};

const source = {
    type: 'source',
    data: {
        description: 'A mock source (LIST).',
        format: 'urn:x-nmos:format:video',
        tags: {},
        label: 'List mock source',
        version: '1559314680:522859008',
        parents: [],
        clock_name: 'clk1',
        caps: {},
        id: '276e3043-d2ef-4444-897d-af897f6cab6b',
        device_id: device.data.id,
    },
};

const flow = {
    type: 'flow',
    data: {
        description:
            'A mock flow (LIST)',
        format: 'urn:x-nmos:format:video',
        components: [
            {
                width: 1920,
                bit_depth: 10,
                name: 'Y',
                height: 1080,
            },
            {
                width: 960,
                bit_depth: 10,
                name: 'Cb',
                height: 1080,
            },
            {
                width: 960,
                bit_depth: 10,
                name: 'Cb',
                height: 1080,
            },
        ],
        colorspace: 'BT709',
        frame_width: 1920,
        label: 'List mock flow',
        frame_height: 1080,
        parents: [],
        interlace_mode: 'interlaced_tff',
        version: '1559471718:770073856',
        source_id: source.data.id,
        media_type: 'video/raw',
        id: 'f0eb533b-c8d1-40f4-8eee-4a38d871da00',
        tags: {},
        device_id: device.data.id,
    },
};

const makeSender = (id, manifest_href) => ({
    type: 'sender',
    data: {
        description: 'A mock sender (LIST).',
        tags: {},
        label: 'List mock sender',
        version: '1559233713:304755968',
        manifest_href,
        flow_id: flow.data.id,
        subscription: {
            active: false,
            receiver_id: null,
        },
        interface_bindings: ['eth0'],
        id,
        transport: 'urn:x-nmos:transport:rtp',
        device_id: device.data.id,
    },
});

module.exports = {
    node,
    device,
    source,
    flow,
    makeSender,
};
