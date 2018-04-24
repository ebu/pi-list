import React, { Component } from 'react';
import classNames from 'classnames';
import { isFunction, isArray, isString, orderBy, isNumber } from 'lodash';
import Loader from 'components/common/Loader';
import Button from 'components/common/Button';
import SimpleMessage from 'components/SimpleMessage';

class Table extends Component {
    constructor() {
        super();

        this.state = {
            hasData: false,
            data: []
        };

        this.includeDataInTable = this.includeDataInTable.bind(this);
    }

    componentWillMount() {
        if (isFunction(this.props.asyncData)) {
            const asyncRequest = this.props.asyncData();

            if (asyncRequest instanceof Promise) {
                asyncRequest.then(this.includeDataInTable);
            } else {
                throw new Error('[LIST | Table] If you\'re using asyncData the function used must return a Promise');
            }
        } else if (isArray(this.props.data)) {
            this.includeDataInTable(this.props.data);
        }
    }

    componentWillReceiveProps(props) {
        this.includeDataInTable(props.data);
    }

    includeDataInTable(data) {
        let tableData = data;

        if (isString(this.props.orderBy)) {
            tableData = orderBy(tableData, [this.props.orderBy], ['desc']);
        }

        if (isNumber(this.props.showFirstElements)) {
            tableData = tableData.slice(0, this.props.showFirstElements);
        }

        this.setState({ data: tableData, hasData: true });
    }

    renderTableHeaderItem(item) {
        return (
            <td
                key={`lst-tb-item-${item.key}-${item.header}`}
                className="lst-table-header__item"
                width={item.width}
            >
                <span className={item.orderBy ? 'lst-table-header__item' : ''}>{item.header}</span>
            </td>
        );
    }

    renderRowItem(rowConfiguration, item) {
        return rowConfiguration.map((row) => {
            return (
                <td
                    key={`${row.key}-${item.id}`}
                    className={classNames('lst-table-body__item', row.cellClassName)}
                >
                    {isFunction(row.render) ? row.render(item) : (
                        <span>{item[row.key]}</span>
                    )}
                </td>
            );
        });
    }

    renderTableRow(item) {
        return (
            <tr
                className="lst-table-row fade-in"
                onClick={() => this.props.onRowClick(item)}
                key={`row-item-${item.id}`}
            >
                {this.renderRowItem(this.props.rows, item)}
                {this.props.showActions && (
                    <td className="lst-table-actions lst-text-right" key={`actions-${item.id}`}>
                        <Button
                            key={`button-actions-${item.id}`}
                            className="lst-table-delete-item-btn"
                            icon="delete"
                            type="danger"
                            link
                            onClick={(evt) => {
                                evt.stopPropagation();

                                this.props.onItemDelete(item);
                            }}
                        />
                    </td>
                )}
            </tr>
        );
    }

    renderTableBody(data) {
        return (
            <tbody className="lst-table-body">
                {data.map(row => this.renderTableRow(row))}
            </tbody>
        );
    }

    renderLoadingTableData() {
        return (
            <div className="lst-table-loading-data col-xs-12 center-xs">
                <Loader size="small" />
            </div>
        );
    }

    render() {
        const tableClassName = classNames('lst-table', {
            'lst-table--fixed': this.props.fixed === true
        });

        return (
            <div className="row lst-no-margin">
                <table className={tableClassName}>
                    <thead className="lst-table-header">
                        <tr>
                            {this.props.rows.map(this.renderTableHeaderItem)}
                        </tr>
                    </thead>
                    {this.state.hasData && this.renderTableBody(this.state.data)}
                </table>
                {!this.state.hasData && this.renderLoadingTableData()}
                {this.state.hasData && this.state.data.length === 0 && (
                    <div className="lst-table-loading-data col-xs-12 center-xs">
                        <SimpleMessage icon="do not disturb" message={this.props.noItemsMessage}/>
                    </div>
                )}
            </div>
        );
    }
}

export default Table;
