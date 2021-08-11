import React from 'react';
import { ButtonWithIcon } from '../index';
import { IComponentProps as ButtonWithIconInterface } from '../ButtonWithIcon/ButtonWithIcon';

function ButtonWithIconSidebarContainer({
    buttonWithIconList,
}: {
    buttonWithIconList: Array<ButtonWithIconInterface>;
}) {
    return (
        <div>
            {buttonWithIconList.map((item, index) => (
                <ButtonWithIcon icon={item.icon} text={item.text} onClick={item.onClick} key={index} />
            ))}
        </div>
    );
}

export default ButtonWithIconSidebarContainer;
