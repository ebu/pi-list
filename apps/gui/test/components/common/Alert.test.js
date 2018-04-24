import React from 'react';
import { shallow } from 'enzyme';
import Alert from 'components/common/Alert';
import renderer from 'react-test-renderer';

describe('components/common/Alert', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <Alert>
                Hello World!
            </Alert>
        );
    });

    describe('Alert Component', () => {
        it('should include a custom className', () => {
            wrapper.setProps({ className: 'custom-classname' });

            expect(wrapper.find('.lst-alert').hasClass('custom-classname')).toBe(true);
        });

        it('should render the children test', () => {
            expect(wrapper.find('.lst-alert').text()).toBe('Hello World!');
        });
    });

    describe('Alert Snapshots', () => {
        it('should render a default alert (danger) with the correct label', () => {
            const tree = renderer
                .create(<Alert>Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a default alert (danger) with the correct label', () => {
            const tree = renderer
                .create(<Alert>Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a danger alert with the correct label', () => {
            const tree = renderer
                .create(<Alert type="danger">Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a success alert with the correct label', () => {
            const tree = renderer
                .create(<Alert type="success">Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a info alert with the correct label', () => {
            const tree = renderer
                .create(<Alert type="info">Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a warning alert with the correct label', () => {
            const tree = renderer
                .create(<Alert type="warning">Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a danger alert with the correct label and correct icon', () => {
            const tree = renderer
                .create(<Alert type="danger" showIcon>Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a success alert with the correct label and correct icon', () => {
            const tree = renderer
                .create(<Alert type="success" showIcon>Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a info alert with the correct label and correct icon', () => {
            const tree = renderer
                .create(<Alert type="info" showIcon>Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a warning alert with the correct label and correct icon', () => {
            const tree = renderer
                .create(<Alert type="warning" showIcon>Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render an alert with custom icon', () => {
            const tree = renderer
                .create(<Alert type="warning" icon="build">Hello world</Alert>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});