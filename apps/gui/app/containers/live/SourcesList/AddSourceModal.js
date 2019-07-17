import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Rodal from 'rodal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { translateC } from '../../../utils/translation';
import 'rodal/lib/rodal.css';
import './AddSourceModal.scss';

const AddSourceModal = props => {
    const [dstAddr, setDstAddr] = useState('');
    const [dstPort, setDstPort] = useState('');

    const isValid = dstAddr !== '' && dstPort !== '';

    const onAdd = () => props.onAdd([{ dstAddr, dstPort }]);

    return (
        <Rodal
            className="lst-add-source-modal"
            visible={props.visible}
            onClose={props.onClose}
            closeOnEsc
        >
            <h2 className="lst-add-source-modal-header">Add source</h2>
            <hr />
            <div className="row lst-align-items-baseline lst-no-margin">
                <div className="col-xs-6">
                    <Input
                        placeholder="Multicast address"
                        value={dstAddr}
                        type="text"
                        onChange={e => setDstAddr(e.target.value)}
                    />
                </div>

                <div className="col-xs-5">
                    <Input
                        placeholder="Port"
                        value={dstPort}
                        type="text"
                        onChange={e => setDstPort(e.target.value)}
                    />
                </div>
                <div className="row lst-text-right lst-add-source-modal-buttons">
                    <Button
                        type="info"
                        label={translateC('workflow.add')}
                        onClick={onAdd}
                        disabled={!isValid}
                    />
                    <Button
                        type="info"
                        label={translateC('workflow.cancel')}
                        onClick={props.onClose}
                    />
                </div>
            </div>
        </Rodal>
    );
};

AddSourceModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired, // receives a list of { dstAddr, dstPort }
    onClose: PropTypes.func.isRequired,
};

AddSourceModal.defaultProps = {};

export default AddSourceModal;
