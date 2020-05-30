import React from 'react';
import classNames from 'classnames';
import { T, translateC } from '../utils/translation';
import api from '../utils/api';
import asyncLoader from '../components/asyncLoader';
import LargeItem from '../components/LargeItem';
import Icon from '../components/common/Icon';
import routeNames from '../config/routeNames';
import navItems from '../config/navList';

const renderItems = (items, live) => {
    return (
        <div className="lst-home-nav__items row center-xs">
            {items
                .filter(item => (item.liveOnly === undefined || item.liveOnly === false
                    ? true
                    : live))
                .map((item) => {
                    const label = <T t={item.labelTag} />;
                    return (
                        <LargeItem
                            key={`lst-home-nav-${item.link}`}
                            link={item.link}
                            icon={item.icon}
                            label={label}
                            exact={item.exact}
                            external={item.external}
                            isOpen={true}
                        />
                    );
                })}
        </div>
    );
}

const HomePage = (props) => {
    const live = props.features.liveFeatures;
    const version = props.version;
    const primaryNavItems = navItems.top
                .filter(item => (item.labelTag === 'navigation.pcaps' ||
                                 item.labelTag === 'navigation.capture'));
    const secondaryNavItems = navItems.top
                .filter(item => (item.labelTag === 'navigation.stream_comparisons' ||
                                 item.labelTag === 'navigation.download_manager' ||
                                 item.labelTag === 'navigation.settings'));

    return (
        <div className="col lst-full-height">
            <nav
                className={classNames('lst-home-nav')}
            >
                <div className="lst-home-nav__header center-xs middle-xs col">
                    <img src="/static/ebu-white.png" alt="ebu logo" />
                    <span><b>LIST</b> {' '} - LiveIP Software Toolkit</span>
                    <span>{`v${version.major}.${version.minor}`}</span>
                </div>

                <hr className="lst-home-nav__separator"/>

                {renderItems(primaryNavItems, live)}

                {renderItems(secondaryNavItems, live)}

                <hr className="lst-home-nav__separator"/>

                <div className="lst-home-nav__footer center-xs">
                    <a href="https://tech.ebu.ch/list" target="_blank">
                        Project Homepage
                    </a>
                    <a href="https://github.com/ebu/pi-list/tree/master/docs" target="_blank">
                        Analysis Documentation
                    </a>
                </div>
            </nav>
        </div>
    );
};

export default asyncLoader(HomePage, {
    asyncRequests: {
        features: () => api.getFeatures(),
        version: () => api.getVersion(),
    },
});
