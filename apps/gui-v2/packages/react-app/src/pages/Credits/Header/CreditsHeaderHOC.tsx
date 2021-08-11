import { Header } from 'components/index';

function CreditsHeaderHOC({ subtitle }: { subtitle: string }) {
    const title = 'Credits';

    return (
        <div>
            <Header headerTitle={title} subtitle={subtitle} />
        </div>
    );
}

export default CreditsHeaderHOC;
