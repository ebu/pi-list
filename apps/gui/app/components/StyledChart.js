import React from 'react';
import Chart from 'components/Chart';
import { useStateValue } from '../utils/AppContext';

const StyledChart = (props) => {
    const [{ theme }, dispatch] = useStateValue();

    return <Chart {...props} colorScheme={theme} />;
};

export default StyledChart;
