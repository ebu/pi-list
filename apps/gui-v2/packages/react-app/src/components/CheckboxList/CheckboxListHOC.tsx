import React from 'react';
import CheckboxList from './CheckboxList';

interface IComponentProps {
    channelsNum: number;
}

function CheckboxListHOC({ channelsNum }: IComponentProps) {
    const channelsArray = Array.from(Array(channelsNum).keys(), x => true);
    const [selectedChannels, setSelectedChannels] = React.useState<boolean[]>(channelsArray); //select all boxs

    return (
        <>
            <CheckboxList channelsArray={selectedChannels} onChangedValue={setSelectedChannels} />
        </>
    );
}

export default CheckboxListHOC;
