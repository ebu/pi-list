import React, { Component } from 'react';
import { find, merge, cloneDeep } from 'lodash';
import Select from 'react-select';
import asyncLoader from '../components/asyncLoader';
import FormInput from '../components/common/FormInput';
import api from '../utils/api';
import Icon from '../components/common/Icon';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import ButtonGroup from '../components/common/ButtonGroup';
import Button from '../components/common/Button';
import keyEnum from '../enums/keyEnum';
import {
    getVideoProfiles,
    getAudioProfiles,
    getVideoInformationByProfile,
    getAudioInformationByProfile,
} from '../code-for-demos/video-presets';
import notifications from '../utils/notifications';
import Panel from '../components/common/Panel';
import { renderInformationList } from '../containers/streamPage/utils';
import { translate, translateC } from '../utils/translation';

class StreamConfiguration extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stream: cloneDeep(this.props.stream),
            profile: null,
            isSendingInformation: false,
        };

        this.selectMediaType = this.selectMediaType.bind(this);
        this.sendStreamsConfiguration = this.sendStreamsConfiguration.bind(
            this
        );
        this.sendStreamInformation = this.sendStreamInformation.bind(this);
        this.autoFillInfo = this.autoFillInfo.bind(this);

        window.addEventListener(
            keyEnum.EVENTS.KEY_UP,
            this.sendStreamInformation
        );
    }

    updateStreamsConfigurationState(nextObject) {
        this.setState(prevState => {
            const stream = Object.assign({}, prevState.stream);
            merge(stream, nextObject);
            return { stream };
        });
    }

    selectMediaType(option) {
        let mediaSpecific = null;

        // This will verify if the stream type is the same of the heuristic results
        if (option.value === this.props.stream.media_type) {
            mediaSpecific = this.props.stream.media_specific;
        }

        this.updateStreamsConfigurationState({
            media_type: option.value,
            media_specific: mediaSpecific,
            profile: null,
        });

        if (option.value === 'video') {
            this.autoFillInfo(null, getVideoInformationByProfile);
        } else if (option.value === 'audio') {
            this.autoFillInfo(null, getAudioInformationByProfile);
        }
    }

    sendStreamInformation(evt) {
        if (evt.key === keyEnum.ENTER) {
            this.sendStreamsConfiguration();
        }
    }

    renderFormGroupHeader(groupLabel, icon) {
        return (
            <React.Fragment>
                <h2>
                    <Icon value={icon} />
                    <span>{translateC(groupLabel)}</span>
                </h2>
                <hr />
            </React.Fragment>
        );
    }

    updateMediaSpecific(attribute, value) {
        const mediaSpecific = this.state.stream.media_specific || {};
        const newMediaSpecific = Object.assign(mediaSpecific, {
            [attribute]: value,
        });

        this.updateStreamsConfigurationState({
            media_specific: newMediaSpecific,
        });
    }

    autoFillInfo(event, mediaSpecificFunction) {
        const newProfile = event ? event.value : null;
        this.setState({ profile: newProfile });

        this.updateStreamsConfigurationState({
            media_specific: mediaSpecificFunction(newProfile),
        });
    }

    renderVideoInformation() {
        const samplingOptions = find(this.props.availableVideoOptions, {
            key: 'sampling',
        }).value;
        const colorimetryOptions = find(this.props.availableVideoOptions, {
            key: 'colorimetry',
        }).value;
        const scanOptions = find(this.props.availableVideoOptions, {
            key: 'scan_type',
        }).value;
        const rateOptions = find(this.props.availableVideoOptions, {
            key: 'rate',
        }).value;
        const mediaSpecific = this.state.stream.media_specific;

        return (
            <React.Fragment>
                <FormInput
                    label={translateC('media_information.video_profiles')}
                >
                    <Select
                        value={this.state.profile}
                        searchable
                        clearable={true}
                        options={this.props.videoProfiles}
                        onChange={option =>
                            this.autoFillInfo(
                                option,
                                getVideoInformationByProfile
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.video.sampling')}
                >
                    <Select
                        value={mediaSpecific ? mediaSpecific.sampling : null}
                        searchable
                        clearable={false}
                        options={samplingOptions}
                        onChange={option =>
                            this.updateMediaSpecific(
                                'sampling',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.video.color_depth')}
                >
                    <Input
                        type="number"
                        value={mediaSpecific.color_depth || 0}
                        min="8"
                        max="32"
                        onChange={evt =>
                            this.updateMediaSpecific(
                                'color_depth',
                                parseInt(evt.currentTarget.value, 10)
                            )
                        }
                    />
                </FormInput>
                <FormInput label={translateC('media_information.video.width')}>
                    <Input
                        type="number"
                        value={mediaSpecific.width || 0}
                        min="0"
                        max="32"
                        onChange={evt =>
                            this.updateMediaSpecific(
                                'width',
                                parseInt(evt.currentTarget.value, 10)
                            )
                        }
                    />
                </FormInput>
                <FormInput label={translateC('media_information.video.height')}>
                    <Input
                        type="number"
                        value={mediaSpecific.height || 0}
                        min="0"
                        max="32"
                        onChange={evt =>
                            this.updateMediaSpecific(
                                'height',
                                parseInt(evt.currentTarget.value, 10)
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.video.scan_type')}
                >
                    <ButtonGroup
                        type="info"
                        options={scanOptions}
                        selected={
                            mediaSpecific
                                ? mediaSpecific.scan_type
                                : 'progressive'
                        }
                        onChange={option =>
                            this.updateMediaSpecific(
                                'scan_type',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
                <FormInput label={translateC('media_information.video.rate')}>
                    <Select
                        value={mediaSpecific ? mediaSpecific.rate : null}
                        searchable
                        clearable={false}
                        options={rateOptions}
                        onChange={option =>
                            this.updateMediaSpecific(
                                'rate',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.video.colorimetry')}
                >
                    <Select
                        value={
                            mediaSpecific
                                ? mediaSpecific.colorimetry
                                : 'unknown'
                        }
                        searchable
                        clearable={false}
                        options={colorimetryOptions}
                        onChange={option =>
                            this.updateMediaSpecific(
                                'colorimetry',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC(
                        'media_information.video.packets_per_frame'
                    )}
                >
                    <Input
                        type="number"
                        value={mediaSpecific.packets_per_frame || 1}
                        min="1"
                        max="32"
                        onChange={evt =>
                            this.updateMediaSpecific(
                                'packets_per_frame',
                                parseInt(evt.currentTarget.value, 10)
                            )
                        }
                    />
                </FormInput>
            </React.Fragment>
        );
    }

    renderAudioInformation() {
        const encodingOptions = find(this.props.availableAudioOptions, {
            key: 'encoding',
        }).value;
        const sampleRateOptions = find(this.props.availableAudioOptions, {
            key: 'sample_rate',
        }).value;
        const packetTimeOptions = find(this.props.availableAudioOptions, {
            key: 'packet_time',
        }).value;
        const mediaSpecific = this.state.stream.media_specific;
        const number_channels =
            mediaSpecific.number_channels === undefined ||
            mediaSpecific.number_channels === null
                ? 1
                : mediaSpecific.number_channels;
        return (
            <React.Fragment>
                <FormInput
                    label={translateC('media_information.audio_profiles')}
                >
                    <Select
                        value={this.state.profile}
                        searchable
                        clearable
                        options={this.props.audioProfiles}
                        onChange={option =>
                            this.autoFillInfo(
                                option,
                                getAudioInformationByProfile
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.audio.encoding')}
                >
                    <Select
                        value={mediaSpecific ? mediaSpecific.encoding : null}
                        searchable
                        clearable={false}
                        options={encodingOptions}
                        onChange={option =>
                            this.updateMediaSpecific(
                                'encoding',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.audio.sampling')}
                >
                    <Select
                        value={mediaSpecific ? mediaSpecific.sampling : null}
                        searchable
                        clearable={false}
                        options={sampleRateOptions}
                        onChange={option =>
                            this.updateMediaSpecific(
                                'sampling',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC(
                        'media_information.audio.number_channels'
                    )}
                >
                    <Input
                        type="number"
                        value={number_channels}
                        min="0"
                        max="64"
                        onChange={evt =>
                            this.updateMediaSpecific(
                                'number_channels',
                                parseInt(evt.currentTarget.value, 10)
                            )
                        }
                    />
                </FormInput>
                <FormInput
                    label={translateC('media_information.audio.packet_time')}
                >
                    <Select
                        value={mediaSpecific ? mediaSpecific.packet_time : null}
                        searchable
                        clearable={false}
                        options={packetTimeOptions}
                        onChange={option =>
                            this.updateMediaSpecific(
                                'packet_time',
                                option ? option.value : null
                            )
                        }
                    />
                </FormInput>
            </React.Fragment>
        );
    }

    renderMediaTypeInformation(mediaType) {
        switch (mediaType) {
            case 'video':
                return this.renderVideoInformation();
            case 'audio':
                return this.renderAudioInformation();
            case 'ancillary_data':
                return <div />;
            case 'unknown':
            default:
                return (
                    <Alert type="danger" showIcon>
                        <strong>
                            {translateC('alerts.media_type_unknown')}
                        </strong>
                        <p>{translateC('information.media_type_unknown')}</p>
                    </Alert>
                );
        }
    }

    renderMediaInformation() {
        return (
            <div className="col-xs-12 col-md-6">
                {this.renderFormGroupHeader(
                    'headings.media_information',
                    'filter'
                )}
                <FormInput label={translateC('media_information.media_type')}>
                    <ButtonGroup
                        type="info"
                        options={this.props.availableOptions}
                        selected={this.state.stream.media_type}
                        onChange={this.selectMediaType}
                    />
                </FormInput>
                {this.renderMediaTypeInformation(this.state.stream.media_type)}
            </div>
        );
    }

    renderNetworkInformation() {
        const netInfo = this.props.stream.network_information;

        return (
            <div className="col-xs-12 col-md-6">
                {this.renderFormGroupHeader(
                    'headings.network_information',
                    'settings ethernet'
                )}
                {renderInformationList([
                    {
                        key: translateC('media_information.rtp.source'),
                        value: `${netInfo.source_address}:${
                            netInfo.source_port
                        }`,
                    },
                    {
                        key: translateC('media_information.rtp.destination'),
                        value: `${netInfo.destination_address}:${
                            netInfo.destination_port
                        }`,
                    },
                    {
                        key: translateC('media_information.rtp.payload_type'),
                        value: netInfo.payload_type,
                    },
                    {
                        key: translateC('media_information.rtp.ssrc'),
                        value: netInfo.ssrc,
                    },
                ])}
            </div>
        );
    }

    sendStreamsConfiguration() {
        const { pcapID, streamID } = this.props;

        this.setState({ isSendingInformation: true });

        api.sendStreamConfigurations(pcapID, streamID, this.state.stream)
            .then(() => {
                this.setState({ isSendingInformation: false });
                notifications.success({
                    title: translate('notifications.success.stream_analysis'),
                    message: translate(
                        'notifications.success.stream_analysis_message'
                    ),
                });
                this.props.onStreamAnalyzed();
            })
            .catch(error => {
                console.log(error);
                this.setState({ isSendingInformation: false });
                notifications.error({
                    title: translate('notifications.error.stream_analysis'),
                    message: translate(
                        'notifications.error.stream_analysis_message'
                    ),
                });
            });
    }

    render() {
        const analyzed = this.props.stream.state === 'analyzed';

        return (
            <React.Fragment>
                <Alert type={analyzed ? 'success' : 'warning'} showIcon>
                    <strong>
                        {analyzed
                            ? translateC('alerts.stream_already_analyzed')
                            : translateC('alerts.stream_missing_information')}
                        !
                    </strong>
                    <p>
                        {analyzed
                            ? translateC(
                                  'information.stream_analyzed_information'
                              )
                            : translateC(
                                  'information.stream_missing_information'
                              )}
                    </p>
                </Alert>
                <Panel>
                    <div className="lst-sdp-config row lst-no-margin">
                        {this.renderNetworkInformation()}
                        {this.renderMediaInformation()}
                    </div>
                    <div className="row end-xs lst-text-right lst-no-margin">
                        <Button
                            type="info"
                            label={translateC('stream.analyze_stream')}
                            disabled={this.state.isSendingInformation}
                            loading={this.state.isSendingInformation}
                            onClick={this.sendStreamsConfiguration}
                        />
                    </div>
                </Panel>
            </React.Fragment>
        );
    }

    componentWillUnmount() {
        window.removeEventListener(
            keyEnum.EVENTS.KEY_UP,
            this.sendStreamInformation
        );
    }
}

export default asyncLoader(StreamConfiguration, {
    asyncRequests: {
        stream: props => api.getStreamHelp(props.pcapID, props.streamID),

        availableOptions: () => api.getSDPAvailableOptions(),

        availableVideoOptions: () => api.getAvailableVideoOptions(),

        availableAudioOptions: () => api.getAvailableAudioOptions(),

        videoProfiles: () => getVideoProfiles(),

        audioProfiles: () => getAudioProfiles(),
    },
});
