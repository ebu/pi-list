import { translate } from '@ebu-list/translations';
import { getComparisonType } from '../../../utils/titles';
import './styles.scss';

function ComparisonConfigPanel({
    comparisonInfo,
    mainPcap,
    referencePcap,
    mainStreamInfo,
    referenceStreamInfo,
    onStreamBadgeClick,
}: any) {
    const renderStreamInfoCard = (title: any, pcapFileName: any, networkInfo: any) => {
        return (
            <>
                <span className="comparison-configuration-panel-title">{title}</span>
                <div>
                    <span className="comparison-configuration-panel-subtitle">Network Capture File: </span>
                    <span className="comparison-configuration-panel-data">{pcapFileName}</span>
                </div>
                <div>
                    <span className="comparison-configuration-panel-title">
                        {` ${
                            comparisonInfo.config.comparison_type === 'crossCorrelation'
                                ? `(channel ${comparisonInfo.config.main.channel})`
                                : ''
                        } `}
                    </span>
                    <div>
                        <span className="comparison-configuration-panel-data">{`S ${networkInfo.source_address}:${
                            networkInfo.source_port
                        } / ${networkInfo.source_mac_address.toUpperCase()}`}</span>
                    </div>
                    <div>
                        <span className="comparison-configuration-panel-data">{`D ${networkInfo.destination_address}:${
                            networkInfo.destination_port
                        } / ${networkInfo.destination_mac_address.toUpperCase()}`}</span>
                    </div>
                </div>
            </>
        );
    };

    const renderVideoInfo = (media: any) => {
        const scan = media?.scan_type === 'interlaced' ? 'i' : 'p';
        const rate_value = eval(media?.rate);
        const rate_frac = rate_value - Math.floor(rate_value);

        const rate = rate_frac < 0.2 ? rate_value : rate_value?.toFixed(2);

        return (
            <div className="comparison-configuration-panel-tags-container">
                <div className="comparison-configuration-panel-tags">{`${media?.height}${scan}${rate}`}</div>
                <span className="comparison-configuration-panel-tags">{`${media?.sampling} ${media?.color_depth} bits`}</span>
            </div>
        );
    };

    const renderAudioInfo = (media: any) => {
        const hz = media?.sampling / 1000;
        return (
            <div className="comparison-configuration-panel-tags-container">
                <span className="comparison-configuration-panel-tags">{`${media?.encoding} ${media?.number_channels}ch`}</span>
                <span className="comparison-configuration-panel-tags">{`${hz} kHz`}</span>
            </div>
        );
    };

    const StreamBadge = ({ streamInfo }: any) => {
        switch (streamInfo.media_type) {
            case 'video':
                return renderVideoInfo(streamInfo.media_specific);
            case 'audio':
                return renderAudioInfo(streamInfo.media_specific);
            default:
                return null;
        }
    };

    return (
        <div className="comparison-configuration-panel-container">
            {/* Configuration (Top Part) */}
            <span className="comparison-configuration-panel-title configuration-title">Configuration</span>
            <div className="comparison-configuration-panel-comparsions-info">
                <div>
                    <span className="comparison-configuration-panel-subtitle">Type: </span>
                    <span className="comparison-configuration-panel-data">{getComparisonType(comparisonInfo.type)}</span>
                </div>
                {comparisonInfo.config.media_type && (
                    <div>
                        <span className="comparison-configuration-panel-subtitle">Media Type: </span>
                        <span className="comparison-configuration-panel-data">{comparisonInfo.config.media_type}</span>
                    </div>
                )}

                {comparisonInfo.config.comparison_type && (
                    <div>
                        <span className="comparison-configuration-panel-subtitle">Comparison Method: </span>
                        <span className="comparison-configuration-panel-data">
                            {translate(`comparison.config.comparison_type.${comparisonInfo.config.comparison_type}`)}
                        </span>
                    </div>
                )}
            </div>
            <div
                onClick={() =>
                    onStreamBadgeClick(comparisonInfo.config.reference.pcap, comparisonInfo.config.reference.stream)
                }
                className="comparison-configuration-panel-steam-data-container"
            >
                <div className="blend-div"></div>
                {renderStreamInfoCard(
                    'Reference Stream',
                    referencePcap.file_name,
                    referenceStreamInfo.network_information
                )}
                <StreamBadge streamInfo={referenceStreamInfo} />
            </div>
            <div
                onClick={() => onStreamBadgeClick(comparisonInfo.config.main.pcap, comparisonInfo.config.main.stream)}
                className="comparison-configuration-panel-steam-data-container"
            >
                <div className="blend-div"></div>
                {renderStreamInfoCard('Main Stream', mainPcap.file_name, mainStreamInfo.network_information)}
                <StreamBadge streamInfo={mainStreamInfo} />
            </div>
        </div>
    );
}

export default ComparisonConfigPanel;
