import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Panel from '../../components/common/Panel';
import Badge from '../../components/common/Badge';
import './ttml.scss';

const InvalidTTMLItem = props => {
    return <div className="row">Invalid</div>;
};

const getCommonBadges = v => {
    const idV = _.get(v, 'id', '');
    const startV = _.get(v, 'start', '');
    const endV = _.get(v, 'end', '');
    const durV = _.get(v, 'dur', '');
    const id = idV === '' ? null : <Badge className="ttml-passive-badge" type="passive" text={`ID: ${idV}`} />;
    const start =
        startV === '' ? null : <Badge className="ttml-passive-badge" type="passive" text={`Start: ${startV}`} />;
    const end = endV === '' ? null : <Badge className="ttml-passive-badge" type="passive" text={`End: ${endV}`} />;
    const dur = durV === '' ? null : <Badge className="ttml-passive-badge" type="passive" text={`Dur: ${durV}`} />;

    return (
        <Fragment>
            {id} {start} {end} {dur}
        </Fragment>
    );
};

const TTMLBr = props => {
    return <br />;
};

const TTMLLeafSpan = props => {
    return (
        <div className="ttml-container">
            <div className="col-xs-12">
                <Badge className="ttml-heading-badge" type="info" text="Span" />
                <div className="ttml-text">{props.value}</div>
            </div>
        </div>
    );
};

const TTMLSpan = props => {
    if (typeof props.value === 'string') {
        return <TTMLLeafSpan value={props.value} />;
    }

    const childrenSpan = _.get(props.value, 'span', []);
    const childrenBr = _.get(props.value, 'br', []);
    const text = _.get(props.value, '#text', undefined);

    return (
        <div className="ttml-container">
            {getCommonBadges(props.value['@'])}
            {text && <TTMLLeafSpan value={text} />}
            {childrenSpan.map((child, index) => (
                <TTMLSpan key={`span-${index}`} value={child} />
            ))}
            {childrenBr.map((child, index) => (
                <TTMLBr key={`br-${index}`} value={child} />
            ))}
        </div>
    );
};

const getSpan = v => {
    if (typeof v === 'string') {
        return <TTMLSpan value={v} />;
    }

    if (Array.isArray(v)) {
        return v.map((child, index) => <TTMLSpan key={`span-${index}`} value={child} />);
    }

    return null;
};

const TTMLP = props => {
    const childrenSpan = getSpan(_.get(props.value, 'span', []));
    const childrenBr = _.get(props.value, 'br', []);

    return (
        <div className="row">
            <div className="ttml-container">
                <Badge className="ttml-heading-badge" type="info" text="P" />
                {getCommonBadges(props.value['@'])}
                {childrenSpan}
                {childrenBr.map((child, index) => (
                    <TTMLBr key={`br-${index}`} value={child} />
                ))}
            </div>
        </div>
    );
};

const TTMLDiv = props => {
    const childrenDiv = _.get(props.value, 'div', []);
    const childrenP = _.get(props.value, 'p', []);

    return (
        <div className="ttml-container">
            <Badge className="ttml-heading-badge" type="info" text="Div" />
            {getCommonBadges(props.value['@'])}
            {childrenDiv.map((child, index) => (
                <TTMLDiv key={`div-${index}`} value={child} />
            ))}
            {childrenP.map((child, index) => (
                <TTMLP key={`p-${index}`} value={child} />
            ))}
        </div>
    );
};

const TTMLBody = props => {
    const children = _.get(props.value, 'div', []);

    return (
        <div className="ttml-container">
            <Badge className="ttml-heading-badge" type="success" text="Body" />
            <Badge className="ttml-passive-badge" type="passive" text={`RTP TS: ${props.ts}`} />
            {getCommonBadges(props.value['@'])}
            {children.map((child, index) => (
                <TTMLDiv key={`div-${index}`} value={child} />
            ))}
        </div>
    );
};

const TTMLItem = props => {
    return (
        <div className="ttml-item">
            <TTMLBody value={props.body[0]} ts={props.ts} />
        </div>
    );
};

TTMLItem.propTypes = {
    ts: PropTypes.string,
    body: PropTypes.arrayOf(PropTypes.object).isRequired,
};

TTMLItem.defaultProps = {
    ts: '',
};

const TTMLInfo = props => {
    const streamInfo = props.streamInfo;

    const entries = _.get(streamInfo, ['media_specific', 'data'], []);

    return (
        <Panel className="lst-stream-ttml-tab">
            {entries.map((item, index) => {
                if (!item.valid) return <InvalidTTMLItem />;

                return <TTMLItem key={`item-${index}`} {...item} />;
            })}
        </Panel>
    );
};

TTMLInfo.propTypes = {
    streamInfo: PropTypes.object.isRequired,
};

TTMLInfo.defaultProps = {};

export default TTMLInfo;
