import React from 'react';
import CreditsList from '../../utils/credits/credits.json';
import CreditsUnknownList from '../../utils/credits/creditsunknown.json';
import { CustomScrollbar } from '../../components';
import './styles.scss';
import CreditsHeaderHOC from './Header/CreditsHeaderHOC';

const ListItems = ({ title, packages }: any) => (
    <>
        {Object.keys(packages).map(key => (
            <tr key={key}>
                <td className="credits-name-data-container">
                    <a href={packages[key].repository} target="_blank">
                        {key}
                    </a>
                </td>
                <td className="credits-centered-value">
                    <a href={packages[key].licenseUrl} target="_blank">
                        {packages[key].licenses}
                    </a>
                </td>
            </tr>
        ))}
    </>
);

function Credits() {
    const subtitle = 'We thank the following projects, all of which are used to build LIST';
    return (
        <>
            <div className="main-page-header">
                <CreditsHeaderHOC subtitle={subtitle} />
            </div>
            <div className="main-page-dashboard">
                <div className="credits-content">
                    <CustomScrollbar>
                        <table className="credits-table">
                            <thead>
                                <tr className="credits-table-tr">
                                    <th className="">Package</th>
                                    <th className="credits-table-centered-header-label">License</th>
                                </tr>
                            </thead>
                            <tbody className="credits-table-tbody">
                                <ListItems title="" packages={{ ...CreditsList }} />
                                {Object.keys(CreditsUnknownList).length > 0 ? (
                                    <ListItems title="Unknown Licenses" packages={{ ...CreditsUnknownList }} />
                                ) : null}
                            </tbody>
                        </table>
                    </CustomScrollbar>
                </div>
            </div>
        </>
    );
}

export default Credits;
