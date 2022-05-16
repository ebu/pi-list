import { IGraphicMinMaxAvgData } from "components";
import _ from 'lodash';

export const getFinalDataMinMaxAvgGraph = (data: IGraphicMinMaxAvgData[]) => {
    const result: IGraphicMinMaxAvgData[] = data.reduce((acc, curr) => {
        if ((!_.isNil(curr.max)) && (!_.isNil(curr.min)) && (!_.isNil(curr.avg))) {
            acc.push(curr);
        }
        return acc;
    }, [] as IGraphicMinMaxAvgData[])
    return result;
}