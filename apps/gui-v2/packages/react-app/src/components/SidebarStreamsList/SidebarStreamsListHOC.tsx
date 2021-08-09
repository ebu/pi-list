import React from 'react';
import { SidebarStreamsList } from '../index';
import { ISidebarItem } from './SidebarStreamsList';

function SidebarStreamsListHOC({ streamsList }: { streamsList: ISidebarItem[] }) {
    const [activeStreamId, setActiveStreamId] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        if (streamsList.length === 0) {
            return;
        }
        setActiveStreamId(streamsList[0].id);
    }, [streamsList]);

    let onItemClicked = (id: string) => {
        setActiveStreamId(id);
    };

    return (
        <div>
            <SidebarStreamsList
                streamsList={streamsList}
                onItemClicked={onItemClicked}
                activeStreamId={activeStreamId}
            />
        </div>
    );
}

export default SidebarStreamsListHOC;
