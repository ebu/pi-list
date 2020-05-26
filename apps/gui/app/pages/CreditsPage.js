import React from 'react';
import './CreditsPage.scss';
import CreditsList from '../../data/credits/credits.json';
import CreditsUnknownList from '../../data/credits/creditsunknown.json';
import StaticCreditsList from '../../data/credits/staticcredits.json';
import { T, translateC } from '../utils/translation';

const ListItems = ({ title, packages }) => (
    <div className="lst-credits-list">
        <h2>{title}</h2>
        <hr />
        <ul>
            {Object.keys(packages).map(key => (
                <li key={key}>
                    <div className="col-xs-10">
                        <a href={packages[key].repository} target="_blank">
                            {key}
                        </a>
                    </div>
                    <div className="col-xs-2">
                        <a href={packages[key].licenseUrl} target="_blank">
                            {packages[key].licenses}
                        </a>
                    </div>
                </li>
            ))}
        </ul>
    </div>
);

const CreditsPage = () => {
    return (
        <div>
            <div className="row">
                <div className="col-xs-12">
                    <h1>{translateC('credits.title')}</h1>
                </div>
                <div className="col-xs-12">
                    <T t="credits.text" />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-6 center">
                    <ListItems title="" packages={{ ...CreditsList, ...StaticCreditsList }} />

                    {Object.keys(CreditsUnknownList).length > 0 ? (
                        <ListItems title="Unknown Licenses" packages={{ ...CreditsUnknownList }} />
                    ) : (
                        ''
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreditsPage;
