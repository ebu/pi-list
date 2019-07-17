import React from 'react';
import { useStateValue } from '../utils/AppContext';
import Chart from 'components/Chart';

const StyledChart = props => {
    const [{ theme }, dispatch] = useStateValue();

    return <Chart {...props} colorScheme={theme} />;
};

export default StyledChart;
