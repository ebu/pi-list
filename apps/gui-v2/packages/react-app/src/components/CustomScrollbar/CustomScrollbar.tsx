import React from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';

const renderThumb = ({ style, ...props }: { style: any }) => {
    const thumbStyle = {
        borderRadius: 6,
        backgroundColor: 'gray',
    };
    return <div style={{ ...style, ...thumbStyle }} {...props} />;
};

function CustomScrollbar(props: any) {
    return <Scrollbars /* renderThumbHorizontal={renderThumb} */ renderThumbVertical={renderThumb} {...props} />;
}

export default CustomScrollbar;
