import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../../../components/common/Input';
import { translateX } from '../../../utils/translation';

const StreamEntry = props => {
    return (
        <div className="row lst-align-items-baseline lst-no-margin">
            <div className="col-xs-7">
                <Input
                    placeholder={translateX('live.sources.name')}
                    value={props.description}
                    type="text"
                    onChange={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'description',
                            value: e.target.value,
                        })
                    }
                />
            </div>
            <div className="col-xs-3">
                <Input
                    placeholder={translateX('live.sources.destination_address')}
                    value={props.dstAddr}
                    type="text"
                    onChange={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'dstAddr',
                            value: e.target.value,
                        })
                    }
                />
            </div>
            <div className="col-xs-2">
                <Input
                    placeholder={translateX('live.sources.destination_port')}
                    value={props.dstPort}
                    type="text"
                    onChange={e =>
                        props.onUpdate({
                            index: props.index,
                            property: 'dstPort',
                            value: e.target.value,
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
    dstPort: PropTypes.string,
    onUpdate: PropTypes.func.isRequired, // receives an object { index: props.index, property: string, value: string }
};

StreamEntry.defaultProps = {
    description: '',
    dstAddr: '',
    dstPort: '',
};

export default StreamEntry;
