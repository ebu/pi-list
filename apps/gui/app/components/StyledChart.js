import React from 'react';
import { ThemeContext } from 'utils/theme';
import Chart from 'components/Chart';

const StyledChart = (props) => {
    return (
        <ThemeContext.Consumer>
            {value => (
                <Chart
                    {...props}
                    colorScheme={value.theme}
                />
            )}
        </ThemeContext.Consumer>
    );
};

export default StyledChart;
