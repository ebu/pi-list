import React, { Component } from 'react';
import classNames from 'classnames';
import { isFunction, isString } from 'lodash';
import Icon from 'components/common/Icon';

class Tab extends Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedTab: 0
        };

        this.renderHeaderTab = this.renderHeaderTab.bind(this);
    }

    renderHeaderTab(header, index) {
        const headerTabClassName = classNames(
            'lst-tab__header-item',
            'center-xs',
            'lst-text-align-middle',
            {
                selected: this.state.selectedTab === index
            }
        );
        return (
            <li
                className={headerTabClassName}
                key={`${header.label}`}
                onClick={() => this.selectTab(index)}
            >
                <h2>
                    {isString(header.icon) ? <Icon value={header.icon} /> : null }
                    {header.label}
                </h2>
            </li>
        );
    }

    selectTab(selectedTab) {
        this.setState({ selectedTab });

        if (isFunction(this.props.onTabChange)) {
            this.props.onTabChange(selectedTab);
        }
    }

    render() {
        return (
            <div className="lst-tab row">
                <ul className="lst-tab__header row col-xs-12">
                    {this.props.headers.map(this.renderHeaderTab)}
                </ul>
                <div className="lst-tab__body col-xs-12">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default Tab;
