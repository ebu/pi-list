import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Rodal from 'rodal';
import moment from 'moment';
import Button from '../../../components/common/Button';
import { translateC, T } from '../../../utils/translation';
import FormInput from '../../../components/common/FormInput';
import Input from '../../../components/common/Input';
import Actions from './Actions';
import 'rodal/lib/rodal.css';
import './Modal.scss';

const defaultDuration = 2000;

const getDescriptionFromSource = source => {
    const label = _.get(source, ['meta', 'label']);
    const dstAddr = _.get(source, 'sdp.streams[0].dstAddr');
    return `${label}-${dstAddr}`;
};

const getSource = (id, sources) => {
    const wanted = sources.find(source => source.id === id);
    return wanted ? wanted : {};
};

const getDescription = (selectedIds, sources) => {
    const descriptions = selectedIds.map(id =>
        getDescriptionFromSource(getSource(id, sources))
    );
    return descriptions.join('-');
};

const StartCaptureModal = props => {
    const [duration, setDuration] = useState(defaultDuration);
    const [description, setDescription] = useState('');
    const [dirty, setDirty] = useState(false);

    const colSizes = { labelColSize: 1, valueColSize: 11 };

    const [now, setNow] = useState(Date.now());

    const onTimer = () => {
        setNow(Date.now());
    };

    useEffect(() => {
        const d = getDescription(props.selectedIds, props.sources);
        const nowS = moment(Date.now()).format('YYYYMMDD-hhmmss');
        setDescription(`${nowS}-${d}`);
    }, [props.selectedIds, props.sources, now]);

    useEffect(() => {
        if (dirty) return;
        const timer = setInterval(onTimer, 500);
        return () => {
            clearInterval(timer);
        };
    }, [dirty]);

    const onStart = () => {
        props.dispatch({ type: Actions.hideStartCapture });
        props.dispatch({
            type: Actions.captureFromSources,
            payload: {
                ids: props.selectedIds,
                filename: description,
                durationMs: duration,
            },
        });
    };

    const handleKey = event => {
        if (event.keyCode == 13) {
            onStart();
        }
    };

    const onClose = () => {
        props.dispatch({ type: Actions.hideStartCapture });
    };

    const onDescriptionFocus = value => {
        console.log('onDescriptionFocus');
        setDirty(true);
    };

    const onChangeDescription = value => {
        setDirty(true);
        setDescription(value);
    };
    const clearDescription = () => {
        setDirty(true);
        setDescription('');
    };

    return (
        <div onKeyUp={handleKey}>
            <Rodal
                className="lst-sources-modal"
                visible={props.visible}
                onClose={onClose}
                closeOnEsc
            >
                <h2 className="lst-sources-modal-header">
                    <T t="navigation.capture" />
                </h2>
                <hr />
                <FormInput icon="timer" {...colSizes}>
                    <div>
                        <Input
                            width="4rem"
                            type="number"
                            min="0"
                            value={duration}
                            onChange={evt =>
                                setDuration(
                                    parseInt(evt.currentTarget.value, 10)
                                )
                            }
                        />
                        <span className="lst-stream-info-units">ms</span>
                    </div>
                </FormInput>
                <div className="row lst-align-items-center lst-no-margin lst-margin--bottom-1">
                    <div className="col-xs-11 lst-no-margin">
                        <FormInput
                            {...colSizes}
                            icon="label"
                            className="lst-no-margin"
                        >
                            <Input
                                type="text"
                                value={description}
                                onChange={evt =>
                                    onChangeDescription(evt.target.value)
                                }
                                onFocus={onDescriptionFocus}
                            />
                        </FormInput>
                    </div>
                    <div className="col-xs-1">
                        <Button
                            className="lst-table-delete-item-btn lst-no-margin lst-no-padding"
                            icon="cancel"
                            type="info"
                            link
                            disabled={!description}
                            onClick={clearDescription}
                        />
                    </div>
                </div>
                <Button
                    type="info"
                    label={translateC('workflow.start_capture')}
                    onClick={onStart}
                    disabled={!description}
                />
                <Button
                    type="info"
                    label={translateC('workflow.cancel')}
                    onClick={onClose}
                />
            </Rodal>
        </div>
    );
};

StartCaptureModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    sources: PropTypes.array.isRequired,
    selectedIds: PropTypes.array.isRequired,
};

StartCaptureModal.defaultProps = {};

export default StartCaptureModal;
