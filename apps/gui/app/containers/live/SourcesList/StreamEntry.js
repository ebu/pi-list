import React from 'react';
import PropTypes from 'prop-types';
import Input from '../../../components/common/Input';
import { translateX } from '../../../utils/translation';
import  Validation from '../../../utils/validators/validation';



const StreamEntry = props => {
    return (
        <div className="row lst-align-items-baseline lst-no-margin">
            <div className="col-xs-7">
                <Input
                    placeholder={translateX('live.sources.name')}
                    value={props.description}
                    border={props.descriptionError ? '1px solid red' : ''}
                    type="text"
                    onChange={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'description',
                            value: e.target.value,
                        })
                    }
                    onBlur={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'descriptionError',
                            value: Validation.isNullOrWhiteSpace(e.target.value),
                        })
                    }
                />
            </div>
            <div className="col-xs-3">
                <Input
                    placeholder={translateX('live.sources.destination_address')}
                    value={props.dstAddr}
                    border={props.dstAddrError ? '1px solid red' : ''}
                    type="text"
                    onChange={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'dstAddr',
                            value: e.target.value,
                        })
                    }
                    onBlur={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'dstAddrError',
                            value: !Validation.isIPV4Address(e.target.value),
                        })
                        
                    }
                />
            </div>
            <div className="col-xs-2">
                <Input
                    placeholder={translateX('live.sources.destination_port')}
                    value={props.dstPort}
                    border={props.dstPortError ? '1px solid red' : ''}
                    type="text"
                    onChange={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'dstPort',
                            value: e.target.value,
                        })
                    }
                    onBlur={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'dstPortError',
                            value: !Validation.isNetworkPort(e.target.value),
                        })
                    }
                />
            </div>
        </div>
    );
};

StreamEntry.propTypes = {
    index: PropTypes.number.isRequired,
    description: PropTypes.string,
    dstAddr: PropTypes.string,
    dstAddrError : PropTypes.bool,
    dstPort: PropTypes.string,
    dstPortError: PropTypes.bool,
    onUpdate: PropTypes.func.isRequired, // receives an object { index: props.index, property: string, value: string }
};

StreamEntry.defaultProps = {
    description: '',
    dstAddr: '',
    dstAddrError: false,
    dstPort: '',
    dstPortError: false,
};

export default StreamEntry;
