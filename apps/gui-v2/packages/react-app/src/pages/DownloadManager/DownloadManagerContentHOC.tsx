import React from 'react';
import { useHistory } from 'react-router-dom';
import list from '../../utils/api';
import SDK from '@bisect/ebu-list-sdk';
import { useRecoilValue } from 'recoil';
import { userAtom } from '../../store/gui/user/userInfo';
import { MainContentLayout } from '../Common';
import DownloadManagerContent from './DownloadManagerContent';

function DownloadManagerContentHOC() {
    const history = useHistory();

    const initial: SDK.types.IDownloadManagerDataContent[] = [];
    const [downloadData, setDownloadData] = React.useState(initial);

    React.useEffect(() => {
        const loadDownloadData = async (): Promise<void> => {
            const all: SDK.types.IDownloadManagerData = await list.downloadManager.getAll();
            const allDataSortedByDate = all.data
                .slice()
                .sort((a, b) => (a.availableon < b.availableon ? 1 : a.availableon === b.availableon ? 0 : -1));
            setDownloadData(allDataSortedByDate);
        };
        loadDownloadData();
    }, []);

    const userInfo = useRecoilValue(userAtom);

    if (!userInfo) {
        return null;
    }

    return (
        <>
            <MainContentLayout
                middlePageContent={<DownloadManagerContent downloadData={downloadData} />}
                informationSidebarContent={{ usermail: userInfo?.username }}
                logout={() => history.push('/logout')}
            />
        </>
    );
}

export default DownloadManagerContentHOC;
