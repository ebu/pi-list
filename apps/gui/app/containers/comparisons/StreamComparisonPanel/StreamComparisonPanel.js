import React, { useState } from 'react';
import moment from 'moment';
import { types as workflowTypes } from 'ebu_list_common/workflows/types';
import api from '../../../utils/api';
import Panel from '../../../components/common/Panel';
import StreamSelectorPanel from '../StreamSelectorPanel';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { translateC, translateX } from '../../../utils/translation';
import notifications from '../../../utils/notifications';
import Select from '../../../components/common/Select';
import './StreamComparisonPanel.scss';

const StreamComparisonPanel = () => {
    const [streamA, setStreamA] = useState(null);
    const [streamB, setStreamB] = useState(null);
    const [description, setDescription] = useState('');

    const onChangeA = v => setStreamA(v);
    const onChangeB = v => setStreamB(v);

    const onCompare = selectedWorkflow => {
        const now = moment(Date.now()).format('YYYYMMDD_HHmmss');
        const name = description ? `${description}` : now;
        const workflowInfo = {
            type: selectedWorkflow,
            configuration: {
                name: name,
                refStreamID: streamA.stream,
                refChannel: streamA.audioChannel,
                mainStreamID: streamB.stream,
                mainChannel: streamB.audioChannel,
            },
        };

        api.createWorkflow(workflowInfo)
            .then(() => {
                notifications.success({
                    titleTag: 'workflow.requested',
                    messageTag: 'workflow.requested',
                });
            })
            .catch((err) => {
                notifications.error({
                    titleTag: 'workflow.request_failed',
                    messageTag: err,
                });
            });
    };

    const onChangeDescription = value => {
        setDescription(value);
    };

    const isDisabled =
        streamA === null ||
        streamA.pcap === null ||
        streamA.stream === null ||
        streamB === null ||
        streamB.pcap === null ||
        streamB.stream === null;

    const title = (
        <>
            <h2>{translateC('comparison.title')}</h2>
            <hr />
        </>
    );

    const workflows = [
        workflowTypes.compareStreams,
        workflowTypes.st2022_7_analysis,
    ];

    const workflowOptions = workflows.map(wf => ({ value: wf, label: translateC(`workflow.names.${wf}`) }));

    const [selectedWorkflow, setSelectedWorkflow] = useState(workflowOptions[0].value);

    return (
        <Panel title={title} className="lst-stream-comparison-panel">
            <div className="row type">
                <h3>{translateX('comparison.type')}:</h3>
                <div className="col-xs-5">
                    <Select
                        options={workflowOptions}
                        value={selectedWorkflow}
                        onChange={e => setSelectedWorkflow(e.value)}
                    />
                </div>
            </div>
            <div className="row stream-selectors">
                <div className="stream-selector">
                    <h3> {translateC('comparison.config.reference')}</h3>
                    <div className="col-xs-12">
                        <StreamSelectorPanel onChange={onChangeA} />
                    </div>
                </div>
                <div className="stream-selector">
                    <h3> {translateC('comparison.config.main')}</h3>
                    <div className="col-xs-12">
                        <StreamSelectorPanel onChange={onChangeB} />
                    </div>
                </div>
            </div>
            <div className="row type">
                <h3>{translateX('name')}:</h3>
                <div className="col-xs-5">
                    <Input type="text" value={description} onChange={evt => onChangeDescription(evt.target.value)} />
                </div>
                <div className="col-xs-2">
                    <Button label="Compare" disabled={isDisabled} onClick={() => onCompare(selectedWorkflow)} />
                </div>
            </div>
        </Panel>
    );
};

export default StreamComparisonPanel;
