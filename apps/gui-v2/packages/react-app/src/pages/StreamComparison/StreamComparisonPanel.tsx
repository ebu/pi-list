import React from 'react';
import { DateTime } from 'luxon';
import { translate } from '../../utils/translation';
import list from '../../utils/api';
import { Notification } from 'components/index';
import StreamSelectorPanel from './StreamSelectorPanel';
import { workflowTypes, comparisonTypes } from './StreamComparisonContentHOC';
import './styles.scss';
import { TransitDelayIcon, AvSyncIcon, DiffTransitDelayIcon, NetworkRedundancyIcon } from 'components/icons/index';
import ItemsList from 'components/DropdownMenu/ItemsList';

function StreamComparisonPanel({
    pcaps,
    onIconsClick,
    selectedWorkflow,
    onSelectedComparisonClick,
    selectedComparison,
}: any) {
    const [streamA, setStreamA] = React.useState<any>({});
    const [streamB, setStreamB] = React.useState<any>({});
    const [description, setDescription] = React.useState('');

    const onChangeA = (v: any) => setStreamA(v);
    const onChangeB = (v: any) => setStreamB(v);

    const workflowRequest = translate('workflow.requested');
    const workflowRequestFailed = translate('workflow.request_failed');

    const onCompare = async (selectedWorkflow: any) => {
        const now = DateTime.now().toFormat('yyyyMMdd_HHmmss');
        const name = description ? `${description}` : now;
        const workflowInfo = {
            type: selectedWorkflow,
            configuration: {
                name: name,
                refStreamID: streamA?.stream,
                refChannel: streamA?.audioChannel,
                mainStreamID: streamB?.stream,
                mainChannel: streamB?.audioChannel,
            },
        };
        await list.workflows
            .create(workflowInfo)
            .then(() => {
                Notification({
                    typeMessage: 'success',
                    message: (
                        <div>
                            <p>{workflowRequest}</p>
                            <p> {workflowRequest} </p>
                        </div>
                    ),
                });
            })
            .catch((err: Error) => {
                Notification({
                    typeMessage: 'error',
                    message: (
                        <div>
                            <p>{workflowRequestFailed}</p>
                            <p> {err} </p>
                        </div>
                    ),
                });
            });
    };

    const onChangeDescription = (value: any) => {
        setDescription(value);
    };

    const isDisabled =
        streamA === null ||
        streamA.pcap === null ||
        streamA.stream === null ||
        streamB === null ||
        streamB.pcap === null ||
        streamB.stream === null;

    console.log(selectedComparison);

    const useaudioChannelSelectorMap: any = {};
    useaudioChannelSelectorMap[workflowTypes.compareStreams] = true;
    useaudioChannelSelectorMap[workflowTypes.st2022_7_analysis] = false;

    const enableAudioChannelSelector: any = useaudioChannelSelectorMap[selectedWorkflow];
    const isComparisonTypeSelected = selectedComparison ? true : false;
    return (
        <div>
            <div className="stream-comparison-panel-container">
                <div>
                    <div className="stream-comparison-icons-title-container">
                        <span className="stream-comparison-icons-container-title">Choose your comparison type</span>
                    </div>
                    <div className="stream-comparison-icons-container">
                        <div
                            onClick={() => {
                                onIconsClick(workflowTypes.compareStreams);
                                onSelectedComparisonClick(comparisonTypes.transitDelay);
                            }}
                            className={`${
                                selectedComparison === 'transitDelay' ? 'selected-stream-comparison-icon' : ''
                            } stream-comparison-icon`}
                        >
                            <span className="stream-comparison-icons-title">Media Transit</span>
                            <TransitDelayIcon className="stream-comparison-icons" />
                        </div>
                        <div
                            onClick={() => {
                                onIconsClick(workflowTypes.compareStreams);
                                onSelectedComparisonClick(comparisonTypes.diffTransitDelay);
                            }}
                            className={`${
                                selectedComparison === 'diffTransitDelay' ? 'selected-stream-comparison-icon' : ''
                            } stream-comparison-icon`}
                        >
                            <span className="stream-comparison-icons-title">Differential Media Transit</span>
                            <DiffTransitDelayIcon className="stream-comparison-icons" />
                        </div>
                        <div
                            onClick={() => {
                                onIconsClick(workflowTypes.st2022_7_analysis);
                                onSelectedComparisonClick(comparisonTypes.networkRedundancy);
                            }}
                            className={`${
                                selectedComparison === 'networkRedundancy' ? 'selected-stream-comparison-icon' : ''
                            } stream-comparison-icon`}
                        >
                            <span className="stream-comparison-icons-title">Network Redundancy</span>
                            <NetworkRedundancyIcon className="stream-comparison-icons" />
                        </div>
                        <div
                            onClick={() => {
                                onIconsClick(workflowTypes.compareStreams);
                                onSelectedComparisonClick(comparisonTypes.avSync);
                            }}
                            className={`${
                                selectedComparison === 'avSync' ? 'selected-stream-comparison-icon' : ''
                            } stream-comparison-icon`}
                        >
                            <span className="stream-comparison-icons-title">Audio-to-Video Sync</span>
                            <AvSyncIcon className="stream-comparison-icons" />
                        </div>
                    </div>
                </div>
            </div>
            {isComparisonTypeSelected ? (
                <div className="stream-comparison-panel-container">
                    <div className="stream-selectors-container">
                        <div className="stream-selector-reference">
                            <h3 className="stream-comparison-panel-h3">Reference:</h3>
                            <div>
                                <StreamSelectorPanel
                                    pcaps={pcaps}
                                    onChange={onChangeA}
                                    enableAudioChannelSelector={enableAudioChannelSelector}
                                    isAudioStream={streamA.audioChannel ? true : false}
                                />
                            </div>
                        </div>
                        <div className="stream-selector-main">
                            <h3 className="stream-comparison-panel-h3">Main:</h3>
                            <div>
                                <StreamSelectorPanel
                                    pcaps={pcaps}
                                    onChange={onChangeB}
                                    enableAudioChannelSelector={enableAudioChannelSelector}
                                    isAudioStream={streamB.audioChannel ? true : false}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="stream-comparison-compare-container">
                        <h3 className="stream-comparison-panel-h3 ">Name:</h3>
                        <div className="stream-comparison-panel-input-container">
                            <input
                                type="text"
                                className="stream-comparison-panel-input"
                                value={description}
                                onChange={evt => onChangeDescription(evt.target.value)}
                            />
                        </div>
                        <div>
                            <button
                                disabled={isDisabled}
                                className="stream-comparison-panel-compare-button"
                                onClick={() => onCompare(selectedWorkflow)}
                            >
                                Compare
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default StreamComparisonPanel;
