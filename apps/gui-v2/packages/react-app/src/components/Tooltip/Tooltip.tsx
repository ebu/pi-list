import React from 'react';
import Tippy from '@tippyjs/react';
import './styles.scss';
import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/svg-arrow.css';

interface ComponentProps {
    content: JSX.Element;
    children: JSX.Element;
}

type Props = React.PropsWithChildren<ComponentProps>;

function Tooltip({ content, children }: Props) {
    return (
        <div>
            <Tippy placement="auto" interactive={true} theme="light" arrow={true} content={content}>
                {children}
            </Tippy>
        </div>
    );
}

export default Tooltip;
