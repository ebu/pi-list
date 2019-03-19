import React from 'react';
import Panel from '../common/Panel';
import SimpleMessage from 'components/SimpleMessage';
import { Scrollbars } from 'react-custom-scrollbars';
import { translate } from 'utils/translation';

const StreamColumn = (props) => {
    const maxHeight = `calc(90vh - 120px)`; // todo: check this!!!!

    return (
        <Panel title={props.title} icon={props.icon} className="lst-stream-column" titleClassName="lst-text-yellow">
            <Scrollbars hideTracksWhenNotNeeded autoHeight autoHeightMax={maxHeight}>
                {
                    props.children
                }
            </Scrollbars>
            { React.Children.count(props.children) === 0 && (
                <Panel noBorder className="center-xs">
                    <SimpleMessage icon="do not disturb" message={translate('stream.no_streams')} />
                </Panel>
            )}
        </Panel>
    );
};

export default StreamColumn;
