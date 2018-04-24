import React from 'react';
import { shallow } from 'enzyme';
import Button from 'components/common/Button';
import renderer from 'react-test-renderer';

describe('components/common/Button', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<Button label="Test button" />);
    });

    describe('Button Component', () => {
        it('should include a custom className', () => {
            wrapper.setProps({ className: 'custom-classname' });

            expect(wrapper.find('.lst-btn').hasClass('custom-classname')).toBe(true);
        });

        it('should call the prop `onClick` when the user click in the button', () => {
            const onClickMock = jest.fn();
            wrapper.setProps({ onClick: onClickMock });

            expect(onClickMock).not.toBeCalled();

            wrapper.find('.lst-btn').simulate('click');

            expect(onClickMock).toBeCalled();
        });
    });

    describe('Button Snapshots', () => {
        it('should render a default button with the correct label', () => {
            const tree = renderer
                .create(<Button label="test"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a success button', () => {
            const tree = renderer
                .create(<Button type="success" label="test"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a warning button', () => {
            const tree = renderer
                .create(<Button type="warning" label="test"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a info button', () => {
            const tree = renderer
                .create(<Button type="info" label="test"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it(`should render a default button if the button type isn't defined`, () => {
            const tree = renderer
                .create(<Button type="lol" label="test"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a default outlined button', () => {
            const tree = renderer
                .create(<Button label="test" outlined/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a primary outlined button', () => {
            const tree = renderer
                .create(<Button type="primary" label="test" outlined/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a success outlined button', () => {
            const tree = renderer
                .create(<Button type="success" label="test" outlined/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a danger outlined button', () => {
            const tree = renderer
                .create(<Button type="danger" label="test" outlined/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a warning outlined button', () => {
            const tree = renderer
                .create(<Button type="warning" label="test" outlined/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a info outlined button', () => {
            const tree = renderer
                .create(<Button type="info" label="test" outlined/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a button without margin', () => {
            const tree = renderer
                .create(<Button type="info" label="test" noMargin/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a disabled button', () => {
            const tree = renderer
                .create(<Button label="test" disabled/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a button as a link', () => {
            const tree = renderer
                .create(<Button label="test" link />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a button with an icon', () => {
            const tree = renderer
                .create(<Button label="test" icon="delete" />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});
