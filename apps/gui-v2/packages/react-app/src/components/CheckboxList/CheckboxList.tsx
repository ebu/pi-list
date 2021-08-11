import React from 'react';
import './style.scss';

export interface IComponentProps {
    channelsArray: boolean[];
    onChangedValue: (newState: boolean[]) => void;
}

function CheckboxList({ channelsArray, onChangedValue }: IComponentProps) {
    const onChange = (index: number, value: boolean) => {
        const newState = { ...channelsArray, [index]: value };
        onChangedValue(newState);
    };

    return (
        <>
            <div className="checkbox-list-title">
                <span>Channels</span>
            </div>
            <div className="checkbox-list">
                {Object.keys(channelsArray).map((item, index) => (
                    <div className="checkbox-container" key={index}>
                        <label className="checkbox-label">
                            <input
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    onChange(parseInt(item), e.target.checked)
                                }
                                type="checkbox"
                                checked={channelsArray[parseInt(item)]}
                            />
                            <span className="checkbox-checkmark"></span>
                        </label>
                        <span>{parseInt(item) + 1}</span>
                    </div>
                ))}
            </div>
        </>
    );
}

export default CheckboxList;
