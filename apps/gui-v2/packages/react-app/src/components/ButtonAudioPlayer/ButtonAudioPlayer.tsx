import React from 'react';
import './styles.scss';
import { PlayIcon, PauseIcon } from '../icons/index';

interface IComponentProps {
    type: string;
    label: any;
    disabled?: boolean;
    onClick: () => void;
    outline: boolean;
    icon?: string;
}

function ButtonAudioPlayer({ type, label, disabled, outline, onClick, icon }: IComponentProps) {
    const buttonClassNames = (type: string, outline: boolean) => {
        let classname = 'lst-btn';
        switch (type) {
            case 'primary':
                classname = classname.concat(' lst-btn--primary');
                break;

            case 'success':
                classname = classname.concat(' lst-btn--success');
                break;

            case 'danger':
                classname = classname.concat(' lst-btn--danger');
                break;

            case 'warning':
                classname = classname.concat(' lst-btn--warning');
                break;

            case 'info':
                classname = classname.concat(' lst-btn--info');
                break;
        }

        if (outline === true) {
            classname = classname.concat(' lst-btn--outline');
        }

        return classname;
    };

    return (
        <button type="button" className={buttonClassNames(type, outline)} onClick={onClick} disabled={disabled}>
            {icon &&
                (icon === 'play arrow' ? (
                    <div className="button-icon">
                        <PlayIcon />
                    </div>
                ) : (
                    <div className="button-icon">
                        <PauseIcon />
                    </div>
                ))}

            <span className="button-label">{label}</span>
        </button>
    );
}

export default ButtonAudioPlayer;
