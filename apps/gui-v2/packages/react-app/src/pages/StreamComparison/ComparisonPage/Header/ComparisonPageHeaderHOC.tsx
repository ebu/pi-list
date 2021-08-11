import { Header } from 'components/index';

function ComparisonPageHeaderHOC() {
    const title = 'Comparison Page';

    return (
        <div>
            <Header headerTitle={title} />
        </div>
    );
}

export default ComparisonPageHeaderHOC;
