import SDK from '@bisect/ebu-list-sdk';
import './styles.scss';
import { AlertIcon } from '../../../../components/icons';

function UnknownAnalysisDisplay({ currentStream }: { currentStream: SDK.types.IStreamInfo | undefined }) {
    const mediaTypeValidationList: any = currentStream?.media_type_validation;
    return (
        <>
            <div className="analysis-page-container">
                {Object.keys(mediaTypeValidationList)
                    .sort()
                    .map(error_codes => {
                        const name = error_codes;
                        const title = mediaTypeValidationList[error_codes];
                        return (
                            <div key={error_codes} className="unknown-analysis-display-tag-container">
                                <div className="unknown-analysis-display-name-icon-container">
                                    <AlertIcon className="unknown-analysis-display-alert-icon" />
                                    <span className="unknown-analysis-display-tag-name">{name}</span>
                                </div>
                                <span className="unknown-analysis-display-title">{title}</span>
                            </div>
                        );
                    })}
            </div>
        </>
    );
}

export default UnknownAnalysisDisplay;
