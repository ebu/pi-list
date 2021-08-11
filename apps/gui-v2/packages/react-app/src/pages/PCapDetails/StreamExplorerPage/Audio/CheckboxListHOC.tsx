import React from 'react';
import { CheckboxList } from 'components/index';

interface IComponentProps {
    channelsNum: number;
    channelsArray: boolean[];
    onChangedValue: (newState: boolean[]) => void;
}

function CheckboxListHOC({ channelsNum, channelsArray, onChangedValue }: IComponentProps) {
    return (
        <>
            <CheckboxList channelsArray={channelsArray} onChangedValue={onChangedValue} />
        </>
    );
}

export default CheckboxListHOC;
