import React, { useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Rodal from 'rodal';
import Button from '../../../components/common/Button';
import { translateC, T } from '../../../utils/translation';
import 'rodal/lib/rodal.css';
import StreamEntry from './StreamEntry';
import './Modal.scss';

const isEmpty = stream =>
    !stream.description && !stream.dstAddr && !stream.dstPort;

const addTrailing = streams => {
    streams.push({ description: '', dstAddr: '', dstPort: '' });
    return streams;
};

const AddSourceModal = props => {
    const [sources, setSources] = useState(addTrailing([]));

    const onUpdate = data => {
        const { index, property, value } = data;

        const n = _.cloneDeep(sources);
        n[index][property] = value;

        const newSources = n.filter((s, idx) => idx === index || !isEmpty(s));

        setSources(addTrailing(newSources));
    };

    const rows = sources.map((stream, index) => (
        <StreamEntry
            key={index}
            index={index}
            {...stream}
            onUpdate={onUpdate}
        />
    ));

    const onAdd = () => {
        const newSources = sources.filter(s => !isEmpty(s));
        setSources(addTrailing([]));
        props.onAdd(newSources);
    };

    const handleKey = event => {
        if (event.keyCode == 13) {
            onAdd();
        }
    };

    const beforeClose = () => {
        setSources(addTrailing([]));
        props.onClose();
    };
    
    return (
        <div onKeyUp={handleKey}>
            <Rodal
                className="lst-sources-modal"
                visible={props.visible}
                onClose={beforeClose}
                closeOnEsc
            >
                <h2 className="lst-sources-modal-header">
                    <T t="live.sources.add_sources" />
                </h2>
                <hr />
                {rows}
                <Button
                    type="info"
                    label={translateC('workflow.add')}
                    onClick={onAdd}
                />
                <Button
                    type="info"
                    label={translateC('workflow.cancel')}
                    onClick={beforeClose}
                />
            </Rodal>
        </div>
    );
};

AddSourceModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired, // receives a list of { dstAddr, dstPort }
    onClose: PropTypes.func.isRequired,
};

AddSourceModal.defaultProps = {};

export default AddSourceModal;
