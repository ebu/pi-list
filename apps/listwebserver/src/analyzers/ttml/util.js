const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const fastXmlParser = require('fast-xml-parser');
const logger = require('../../util/logger');
const { appendError } = require('../utils');
const constants = require('../../enums/analysis');

const xmlParseOptions = {
    attributeNamePrefix: '',
    attrNodeName: '@',
    textNodeName: '#text',
    arrayMode: true,
    parseNodeValue: false,
    parseAttributeValue: false,
    ignoreAttributes: false,
    ignoreNameSpace: true, // TODO: ideally, we should use a parser with full support for namespaces
};

// sync
const doLoadTtmlDocuments = (ttmlFilesPath, stream) => {
    const options = {
        cwd: ttmlFilesPath,
    };
    const xml_files = glob.sync('*', options);

    const xml_data = xml_files.map(f => {
        const p = path.join(ttmlFilesPath, f);
        try {
            // TODO: assumes UTF-8 encoded XML documents
            const data = fs.readFileSync(p, 'utf8');
            const item = JSON.parse(data);
            const rtp_timestamp = _.get(item, 'rtp_timestamp');
            const xmlText = _.get(item, 'xml');

            const validationResult = fastXmlParser.validate(xmlText);

            if (validationResult !== true) {
                logger('ttml-analysis').error(`Invalid TTML - ${validationResult.err.msg}: ${xmlText}`);
                return { valid: false, ts: rtp_timestamp, doc: xmlText };
            }

            const xml = fastXmlParser.parse(xmlText, xmlParseOptions);

            const items = {};

            items.timeBase = _.get(xml, ['tt', '0', '@', 'timeBase'], undefined);
            items.sequenceIdentifier = _.get(xml, ['tt', '0', '@', 'sequenceIdentifier'], undefined);
            items.body = _.get(xml, ['tt', '0', 'body'], undefined);

            return { valid: true, ts: rtp_timestamp, doc: xmlText, ...items };
        } catch (e) {
            console.error(e);
        }
        console.log(xml_data);
    })
    .filter(e => e.valid);

    stream.media_specific = {
        data: xml_data,
    };

    return stream;
};

// sync
const doAnalyseTimeBase = stream => {
    const isAnyTimebaseNotMedia = stream.media_specific.data.some(d => {
        if (!d.valid) return false;
        return d.timeBase !== 'media';
    });

    if (isAnyTimebaseNotMedia) {
        stream = _.set(stream, 'analyses.ttml_time_base_is_media.result', constants.outcome.not_compliant);
        stream = appendError(stream, { id: constants.errors.ttml_time_base_is_not_media });
    } else {
        stream = _.set(stream, 'analyses.ttml_time_base_is_media.result', constants.outcome.compliant);
    }

    return stream;
};

// sync
const doAnalyseSequenceIdentifier = stream => {
    const seqIds = [...new Set(stream.media_specific.data.map(d => d.sequenceIdentifier))];

    if (stream.media_specific.data.length !== 0 && seqIds.length !== 1) {
        stream = _.set(stream, 'analyses.ttml_consistent_sequence_identifier.result', constants.outcome.not_compliant);
        stream = appendError(stream, { id: constants.errors.ttml_inconsistent_sequence_identifier });
    } else {
        stream = _.set(stream, 'analyses.ttml_consistent_sequence_identifier.result', constants.outcome.compliant);
    }

    return stream;
};

module.exports = {
    doLoadTtmlDocuments,
    doAnalyseTimeBase,
    doAnalyseSequenceIdentifier,
};
