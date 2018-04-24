import React from 'react';
import Panel from 'components/common/Panel';
import SimpleMessage from 'components/SimpleMessage';

const StreamColumn = (props) => {

    return (
        <Panel title={props.title} icon={props.icon} className="lst-stream-column">
            {
                props.children
            }
            { React.Children.count(props.children) === 0 && (
                <Panel noBorder className="center-xs">
                    <SimpleMessage icon="do not disturb" message={"No Streams Found"}/>
                </Panel>
            )}
        </Panel>
    );
};

export default StreamColumn;
