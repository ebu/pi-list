import React, { useState, useEffect } from 'react';
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

    const haveErrors = stream => {
        if (stream.dstAddrError == true || stream.dstPortError == true || stream.descriptionError == true)
            return true;
    
        return false;
    }
    

const EditSourceModal = props => {
    const [sources, setSources] = useState([]);

    useEffect (() => {
        setSources(props.sources);
    }, [props.sources]);


    const onUpdate = data => {
        const { index, property, value } = data;
        
        const n = _.cloneDeep(sources);
        n[index][property] = value;

        const newSources = n.filter((s, idx) => idx === index || !isEmpty(s));

        setSources(newSources);
    };

    const rows = sources.map((stream, index) => (
        <StreamEntry
            key={index}
            index={index}
            {...stream}
            onUpdate={onUpdate}
        />
    ));

    const errors = sources.some(s => haveErrors(s)) ? (<div>Please correct field errors.</div>) : "";

    const onEdit = () => {
        const newSources = sources.filter(s => !isEmpty(s));
        setSources(newSources);
        props.onEdit(newSources);
    };

    const handleKey = event => {
        if (event.keyCode == 13) {
            onEdit();
        }
    };

    const beforeClose = () => {
        setSources(props.sources);
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
                    <T t="live.sources.edit_sources" />
                </h2>
                <hr />
                {rows.length == 0 ? <div>No data to present</div> : rows}
                {errors}
                <Button
                    type="info"
                    label={translateC('workflow.update')}
                    onClick={onEdit}
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

EditSourceModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onEdit: PropTypes.func.isRequired, // receives a list of { dstAddr, dstPort }
    onClose: PropTypes.func.isRequired,
};

EditSourceModal.defaultProps = {};

export default EditSourceModal;
