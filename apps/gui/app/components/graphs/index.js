import LineGraphHOC from './LineGraphHOC';
import HistogramHOC from './HistogramHOC';
import { histogramAsPercentages } from './utils';

import './index.scss';

export default { Line: LineGraphHOC, Histogram: HistogramHOC };

export { histogramAsPercentages };
