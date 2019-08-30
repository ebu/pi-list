import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Panel from '../../components/common/Panel';
import moment from 'moment';
import Button from '../../components/common/Button';
import { translateC, T } from '../../utils/translation';
import FormInput from '../../components/common/FormInput';
import Input from '../../components/common/Input';
import Actions from './Actions';
import 'rodal/lib/rodal.css';

const defaultDuration = 2000;

const getDescription = source => {
    const label = _.get(source, ['meta', 'label']);
    const l = label ? `_${label}` : '';
    const dstAddr = _.get(source, 'sdp.streams[0].dstAddr');
    return `${dstAddr}${l}`;
};

const CapturePanel = props => {
    const [duration, setDuration] = useState(defaultDuration);
    const [description, setDescription] = useState('');

    const colSizes = { labelColSize: 1, valueColSize: 11 };

    const startOne = (source) => {
        const now = moment(Date.now()).format('YYYYMMDD_HHmmss');
        const d = description ? `${description}_` : '';
        const filename = `${now}_${d}${getDescription(source)}`;

        props.dispatch({
            type: Actions.captureFromSources,
            payload: {
                ids: [source.id],
                filename: filename,
                durationMs: duration,
            },
        });
    };

    const onStartSerial = () => {
        props.sources.forEach(startOne);
    };

    const onStartParallel = () => {
        const now = moment(Date.now()).format('YYYYMMDD_HHmmss');
        const d = description ? `_${description}` : '';
        const filename = `${now}${d}`;

        props.dispatch({
            type: Actions.captureFromSources,
            payload: {
                ids: props.sources.map(source => source.id),
                filename: filename,
                durationMs: duration,
            },
        });
    };

    const handleKey = event => {
        if (event.keyCode == 13) {
            // onStartSerial();
        }
    };

    const onChangeDescription = value => {
        setDescription(value);
    };

    const clearDescription = () => {
        setDescription('');
    };

    const title = <T t="navigation.capture" />;
    return (
        <Panel containerClassName="slow-fade-in" title={title}>
            <div onKeyUp={handleKey}>
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
                    label={translateC('workflow.start_capture.serial')}
                    onClick={onStartSerial}
                    disabled={props.sources.length === 0}
                />
                <Button
                    type="info"
                    label={translateC('workflow.start_capture.parallel')}
                    onClick={onStartParallel}
                    disabled={props.sources.length < 2}
                />
                <span>{props.sources.length} sources</span>
            </div>
        </Panel>
    );
};

CapturePanel.propTypes = {
    visible: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    sources: PropTypes.array.isRequired,
};

CapturePanel.defaultProps = {};

export default CapturePanel;
