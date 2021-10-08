import React from 'react';
import SDK from '@bisect/ebu-list-sdk';
import _ from 'lodash';
import './styles.scss';

const Badge = (props: any) => {
    let title = '';
    if (props.title != 'undefined') {
        title = props.title;
    }
    return (
        <span title={title} className={props.className}>
            {props.text}
        </span>
    );
};

const InvalidTTMLItem = (props: any) => {
    return <div className="row">Invalid</div>;
};

const getCommonBadges = (v: any) => {
    const idV = _.get(v, 'id', '');
    const startV = _.get(v, 'start', '');
    const endV = _.get(v, 'end', '');
    const durV = _.get(v, 'dur', '');
    const id = idV === '' ? null : <Badge className="ttml-passive-badge" text={`ID: ${idV}`} />;
    const start = startV === '' ? null : <Badge className="ttml-passive-badge" text={`Start: ${startV}`} />;
    const end = endV === '' ? null : <Badge className="ttml-passive-badge" text={`End: ${endV}`} />;
    const dur = durV === '' ? null : <Badge className="ttml-passive-badge" text={`Dur: ${durV}`} />;

    return (
        <>
            {id} {start} {end} {dur}
        </>
    );
};

const TTMLBr = (props: any) => {
    return <br />;
};

const TTMLLeafSpan = (props: any) => {
    return (
        <div className="ttml-container">
            <div className="">
                <Badge className="ttml-heading-badge" type="info" text="Span" />
                <div className="ttml-text">{props.value}</div>
            </div>
        </div>
    );
};

const TTMLSpan = (props: any) => {
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
            {childrenSpan.map((child: any, index: any) => (
                <TTMLSpan key={`span-${index}`} value={child} />
            ))}
            {childrenBr.map((child: any, index: any) => (
                <TTMLBr key={`br-${index}`} value={child} />
            ))}
        </div>
    );
};

const getSpan = (v: any) => {
    if (typeof v === 'string') {
        return <TTMLSpan value={v} />;
    }

    if (Array.isArray(v)) {
        return v.map((child, index) => <TTMLSpan key={`span-${index}`} value={child} />);
    }

    return null;
};

const TTMLP = (props: any) => {
    const childrenSpan = getSpan(_.get(props.value, 'span', []));
    const childrenBr = _.get(props.value, 'br', []);

    return (
        <div className="row">
            <div className="ttml-container">
                <Badge className="ttml-heading-badge" type="info" text="P" />
                {getCommonBadges(props.value['@'])}
                {childrenSpan}
                {childrenBr.map((child: any, index: any) => (
                    <TTMLBr key={`br-${index}`} value={child} />
                ))}
            </div>
        </div>
    );
};

const TTMLDiv = (props: any) => {
    const childrenDiv = _.get(props.value, 'div', []);
    const childrenP = _.get(props.value, 'p', []);

    return (
        <div className="ttml-container">
            <Badge className="ttml-heading-badge" type="info" text="Div" />
            {getCommonBadges(props.value['@'])}
            {childrenDiv.map((child: any, index: any) => (
                <TTMLDiv key={`div-${index}`} value={child} />
            ))}
            {childrenP.map((child: any, index: any) => (
                <TTMLP key={`p-${index}`} value={child} />
            ))}
        </div>
    );
};

const TTMLBody = (props: any) => {
    const children = _.get(props.value, 'div', []);

    return (
        <div className="ttml-container">
            <Badge className="ttml-heading-badge" type="success" text="Body" />
            {getCommonBadges(props.value['@'])}
            {children.map((child: any, index: any) => (
                <TTMLDiv key={`div-${index}`} value={child} />
            ))}
        </div>
    );
};

const TTMLItem = (props: any) => {
    return (
        <div className="ttml-item">
            <Badge className="ttml-rtpts-badge" text={`RTP TS: ${props.ts}`} />
            <TTMLBody value={props.body[0]} ts={props.ts} />
        </div>
    );
};

function TtmlStreamExplorerDisplay({
    currentStream,
    pcapID,
}: {
    currentStream: SDK.types.IStreamInfo | undefined;
    pcapID: string;
}) {
    const streamInfo = currentStream;

    const entries = _.get(streamInfo, ['media_specific', 'data'], []);

    return (
        <div className="ttml-containers">
            {entries.map((item: any, index: any) => {
                if (!item.valid) return <InvalidTTMLItem />;

                return <TTMLItem key={`item-${index}`} {...item} />;
            })}
        </div>
    );
}

export default TtmlStreamExplorerDisplay;
