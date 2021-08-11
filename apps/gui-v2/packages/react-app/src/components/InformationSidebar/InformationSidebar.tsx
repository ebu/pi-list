import React from 'react';
import './styles.scss';
import { DropdownMenu } from '../index';
import { ArrowCollapsedIcon } from '../icons';
import { translate } from '../../utils/translation';

interface IComponentProps {
    usermail: string;
    content?: React.ReactElement;
    logout: () => void;
}

const button = (usermail: string) => (
    <div className="sb-dropdown-menu-button-container">
        <span className="information-sidebar-user-mail">{usermail}</span>
        <ArrowCollapsedIcon />
    </div>
);

function InformationSidebar({ usermail, content, logout }: IComponentProps) {
    const data = [
        {
            value: '1',
            label: translate('user_account.logout'),
        },
    ];
    const onChangeDropdownMenu = (menu: string): void => {
        switch (menu) {
            case '1':
            default:
                logout();
        }
    };
    return (
        <div className="information-sidebar">
            <div className="login-information">
                <DropdownMenu
                    width={10}
                    options={data}
                    disabled={false}
                    button={button(usermail)}
                    className="information-sidebar-dropdown is-right"
                    onChange={(menu: string) => onChangeDropdownMenu(menu)}
                />
            </div>

            <div className="information-sidebar-content">{content}</div>
        </div>
    );
}

export default InformationSidebar;
