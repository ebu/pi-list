import { Header } from 'components/index';

function DownloadManagerHeaderHOC() {
    const title = 'Download Manager';

    return (
        <div>
            <Header headerTitle={title} />
        </div>
    );
}

export default DownloadManagerHeaderHOC;
