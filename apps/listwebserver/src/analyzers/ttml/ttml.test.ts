import _ from 'lodash';
import fs from 'fs';
const path = require('path');
const tmp = require('tmp');
const { doLoadTtmlDocuments, doAnalyseTimeBase, doAnalyseSequenceIdentifier } = require('./util');
const constants = require('../../enums/analysis');

const j1 = {
    rtp_timestamp: '794409082',
    xml: `
<tt:tt xmlns:tt="http://www.w3.org/ns/ttml" xmlns:ebuttExt="urn:ebu:tt:extension" xmlns:ebuttm="urn:ebu:tt:metadata" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xmlns:tts="http://www.w3.org/ns/ttml#styling" ttp:timeBase="media" ttp:cellResolution="50 30" tts:extent="1920px 1080px" ebuttm:sequenceIdentifier="1a003117-a2ef-4e0f-97b1-bcd0d89d5bba" ebuttm:sequenceNumber="53673">
    <tt:head>
        <tt:metadata>
            <ebuttm:documentMetadata>
                <ebuttm:documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion>
            </ebuttm:documentMetadata>
        </tt:metadata>
        <tt:styling>
            <tt:style xml:id="defaultStyle" tts:fontFamily="monospaceSansSerif" tts:fontSize="1c 2c" tts:textAlign="center" tts:color="white" tts:backgroundColor="black" />
        </tt:styling>
        <tt:layout>
            <tt:region xml:id="bottom" tts:origin="10%% 10%%" tts:extent="80%% 80%%" tts:displayAlign="after" />
        </tt:layout>
    </tt:head>
    <tt:body dur="00:00:10">
        <tt:div style="defaultStyle">
            <tt:p xml:id="sub" region="bottom">
                <tt:span>2019-12-13 15:17:10.947544</tt:span>
            </tt:p>
        </tt:div>
    </tt:body>
    </tt:tt>
`,
};

const j_invalid_timebase = {
    rtp_timestamp: '794409082',
    xml: `
<tt:tt xmlns:tt="http://www.w3.org/ns/ttml" xmlns:ebuttExt="urn:ebu:tt:extension" xmlns:ebuttm="urn:ebu:tt:metadata" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xmlns:tts="http://www.w3.org/ns/ttml#styling" ttp:timeBase="clock" ttp:cellResolution="50 30" tts:extent="1920px 1080px" ebuttm:sequenceIdentifier="1a003117-a2ef-4e0f-97b1-bcd0d89d5bba" ebuttm:sequenceNumber="53673">
    <tt:head>
        <tt:metadata>
            <ebuttm:documentMetadata>
                <ebuttm:documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion>
            </ebuttm:documentMetadata>
        </tt:metadata>
        <tt:styling>
            <tt:style xml:id="defaultStyle" tts:fontFamily="monospaceSansSerif" tts:fontSize="1c 2c" tts:textAlign="center" tts:color="white" tts:backgroundColor="black" />
        </tt:styling>
        <tt:layout>
            <tt:region xml:id="bottom" tts:origin="10%% 10%%" tts:extent="80%% 80%%" tts:displayAlign="after" />
        </tt:layout>
    </tt:head>
    <tt:body dur="00:00:10">
        <tt:div style="defaultStyle">
            <tt:p xml:id="sub" region="bottom">
                <tt:span>2019-12-13 15:17:10.947544</tt:span>
            </tt:p>
        </tt:div>
    </tt:body>
    </tt:tt>
`,
};

const j1_different_seq_id = {
    rtp_timestamp: '794409082',
    xml: `
<tt:tt xmlns:tt="http://www.w3.org/ns/ttml" xmlns:ebuttExt="urn:ebu:tt:extension" xmlns:ebuttm="urn:ebu:tt:metadata" xmlns:ttp="http://www.w3.org/ns/ttml#parameter" xmlns:tts="http://www.w3.org/ns/ttml#styling" ttp:timeBase="media" ttp:cellResolution="50 30" tts:extent="1920px 1080px" ebuttm:sequenceIdentifier="1a003117-a2ef-4e0f-97b1-bcd0d89d5bbc" ebuttm:sequenceNumber="53673">
    <tt:head>
        <tt:metadata>
            <ebuttm:documentMetadata>
                <ebuttm:documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion>
            </ebuttm:documentMetadata>
        </tt:metadata>
        <tt:styling>
            <tt:style xml:id="defaultStyle" tts:fontFamily="monospaceSansSerif" tts:fontSize="1c 2c" tts:textAlign="center" tts:color="white" tts:backgroundColor="black" />
        </tt:styling>
        <tt:layout>
            <tt:region xml:id="bottom" tts:origin="10%% 10%%" tts:extent="80%% 80%%" tts:displayAlign="after" />
        </tt:layout>
    </tt:head>
    <tt:body dur="00:00:10">
        <tt:div style="defaultStyle">
            <tt:p xml:id="sub" region="bottom">
                <tt:span>2019-12-13 15:17:10.947544</tt:span>
            </tt:p>
        </tt:div>
    </tt:body>
    </tt:tt>
`,
};

const expectedItems1 = {
    sequenceIdentifier: '1a003117-a2ef-4e0f-97b1-bcd0d89d5bba',
    timeBase: 'media',
    body: [
        {
            '@': {
                dur: '00:00:10',
            },
            div: [
                {
                    '@': {
                        style: 'defaultStyle',
                    },
                    p: [
                        {
                            '@': {
                                id: 'sub',
                                region: 'bottom',
                            },
                            span: '2019-12-13 15:17:10.947544',
                        },
                    ],
                },
            ],
        },
    ],
};

function prepareFiles(contents: any) {
    const tmpDir = tmp.dirSync().name;
    contents.forEach((data: any, index: any) => {
        const tmpFile = path.join(tmpDir, index.toFixed(0));
        fs.writeFileSync(tmpFile, JSON.stringify(data));
    });

    return tmpDir;
}

test('doLoadTtmlDocuments: single document', () => {
    const ttmlDir = prepareFiles([j1]);

    const inStream = {
        id: '1',
    };

    const expectedStream = {
        id: '1',
        media_specific: {
            data: [
                {
                    valid: true,
                    ts: j1.rtp_timestamp,
                    doc: j1.xml,
                    ...expectedItems1,
                },
            ],
        },
    };

    const result = doLoadTtmlDocuments(ttmlDir, inStream);

    expect(result).toStrictEqual(expectedStream);

    const result2 = doAnalyseTimeBase(result);
    const expected2 = {
        ...expectedStream,
        analyses: {
            ttml_time_base_is_media: {
                result: constants.outcome.compliant,
            },
        },
    };
    expect(result2).toStrictEqual(expected2);
});

test('doLoadTtmlDocuments: two documents', () => {
    const ja = _.cloneDeep(j1);
    const jb: any = _.cloneDeep(j1);
    jb.rtp_timestamp = 123;

    const ttmlDir = prepareFiles([ja, jb]);

    const inStream = {
        id: '1',
    };

    const expectedStream = {
        id: '1',
        media_specific: {
            data: [
                {
                    valid: true,
                    ts: ja.rtp_timestamp,
                    doc: ja.xml,
                    ...expectedItems1,
                },
                {
                    valid: true,
                    ts: jb.rtp_timestamp,
                    doc: jb.xml,
                    ...expectedItems1,
                },
            ],
        },
    };

    const result = doLoadTtmlDocuments(ttmlDir, inStream);

    expect(result).toStrictEqual(expectedStream);

    const result2 = doAnalyseTimeBase(result);
    const expected2 = {
        ...expectedStream,
        analyses: {
            ttml_time_base_is_media: {
                result: constants.outcome.compliant,
            },
        },
    };
    expect(result2).toStrictEqual(expected2);
});

test('doLoadTtmlDocuments: invalid document', () => {
    const j = _.cloneDeep(j1);
    j.xml = '<x>invalid xml<x';

    const ttmlDir = prepareFiles([j]);

    const inStream = {
        id: '1',
    };

    const expectedStream = {
        id: '1',
        media_specific: {
            data: [],
        },
    };

    const result = doLoadTtmlDocuments(ttmlDir, inStream);

    expect(result).toStrictEqual(expectedStream);

    const result2 = doAnalyseTimeBase(result);
    const expected2 = {
        ...expectedStream,
        analyses: {
            ttml_time_base_is_media: {
                result: constants.outcome.compliant,
            },
        },
    };
    expect(result2).toStrictEqual(expected2);
});

test('doAnalyseTimeBase: invalid timebase', () => {
    const j = _.cloneDeep(j_invalid_timebase);
    const ttmlDir = prepareFiles([j]);

    const inStream = {
        id: '1',
    };

    const expectedStream = {
        id: '1',
        media_specific: {
            data: [
                {
                    valid: true,
                    ts: j1.rtp_timestamp,
                    doc: j_invalid_timebase.xml,
                    ...expectedItems1,
                    timeBase: 'clock',
                },
            ],
        },
    };

    const result = doLoadTtmlDocuments(ttmlDir, inStream);

    expect(result).toStrictEqual(expectedStream);

    const result2 = doAnalyseTimeBase(result);
    const expected2 = {
        ...expectedStream,
        analyses: {
            ttml_time_base_is_media: {
                result: constants.outcome.not_compliant,
            },
        },
        error_list: [
            {
                id: constants.errors.ttml_time_base_is_not_media,
            },
        ],
    };
    expect(result2).toStrictEqual(expected2);
});

test('doAnalyseSequenceIdentifier: two consistent documents', () => {
    const ja = _.cloneDeep(j1);
    const jb = _.cloneDeep(j1);

    const ttmlDir = prepareFiles([ja, jb]);

    const inStream = {
        id: '1',
    };

    const expectedStream = {
        id: '1',
        media_specific: {
            data: [
                {
                    valid: true,
                    ts: ja.rtp_timestamp,
                    doc: ja.xml,
                    ...expectedItems1,
                },
                {
                    valid: true,
                    ts: jb.rtp_timestamp,
                    doc: jb.xml,
                    ...expectedItems1,
                },
            ],
        },
    };

    const result = doLoadTtmlDocuments(ttmlDir, inStream);
    const result2 = doAnalyseSequenceIdentifier(result);
    const expected2 = {
        ...expectedStream,
        analyses: {
            ttml_consistent_sequence_identifier: {
                result: constants.outcome.compliant,
            },
        },
    };
    expect(result2).toStrictEqual(expected2);
});

test('doAnalyseSequenceIdentifier: two inconsistent documents', () => {
    const ja = _.cloneDeep(j1);
    const jb = _.cloneDeep(j1_different_seq_id);

    const ttmlDir = prepareFiles([ja, jb]);

    const inStream = {
        id: '1',
    };

    const expectedStream = {
        id: '1',
        media_specific: {
            data: [
                {
                    valid: true,
                    ts: ja.rtp_timestamp,
                    doc: ja.xml,
                    ...expectedItems1,
                },
                {
                    valid: true,
                    ts: jb.rtp_timestamp,
                    doc: jb.xml,
                    ...expectedItems1,
                    sequenceIdentifier: '1a003117-a2ef-4e0f-97b1-bcd0d89d5bbc',
                },
            ],
        },
    };

    const result = doLoadTtmlDocuments(ttmlDir, inStream);
    const result2 = doAnalyseSequenceIdentifier(result);
    const expected2 = {
        ...expectedStream,
        analyses: {
            ttml_consistent_sequence_identifier: {
                result: constants.outcome.not_compliant,
            },
        },
        error_list: [
            {
                id: constants.errors.ttml_inconsistent_sequence_identifier,
            },
        ],
    };
    expect(result2).toStrictEqual(expected2);
});
