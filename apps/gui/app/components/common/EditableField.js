import React, { Component } from 'react';
import { RIEInput } from 'riek';

const name = 'value';

class EditableField extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: this.props.value
        };

        this.httpRequest = this.httpRequest.bind(this);
    }

    httpRequest(data) {
        this.props.updateFunction(data.value)
            .then(() => {
                this.setState({ value: data[name] });
            });
    }

    render() {
        return (
            <RIEInput
                value={this.state.value}
                change={data => this.httpRequest(data)}
                className={this.props.className}
                shouldBlockWhileLoading
                propName={name}
            />
        );
    }
}

export default EditableField;
