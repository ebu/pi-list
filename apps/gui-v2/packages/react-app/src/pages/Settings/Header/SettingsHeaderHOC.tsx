import { Header } from 'components/index';

function SettingsHeaderHOC() {
    const title = 'Settings';

    return (
        <div>
            <Header headerTitle={title} />
        </div>
    );
}

export default SettingsHeaderHOC;
