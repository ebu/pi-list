import { Header } from 'components/index';

function CaptureHeaderHOC() {
    const title = 'Capture';

    return (
        <div>
            <Header headerTitle={title} />
        </div>
    );
}

export default CaptureHeaderHOC;
