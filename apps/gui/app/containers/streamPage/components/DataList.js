import React, { Fragment } from 'react';
import { translate } from 'utils/translation';
import DataLine from './DataLine';

const DataList = props => {
    const information = props.values;

    return (
        <Fragment>
            {
                information.map(item => {
                    const label = item.label || translate(item.labelTag);
                    return (<DataLine
                        labelWidth={props.labelWidth || 6}
                        valueWidth={props.valueWidth || 6}
                        key={`${label}_${item.value}`}
                        label={label}
                        value={item.value}
                        units={item.units}
                    />);
                })
            }
        </Fragment>
    );
};

export default DataList;
