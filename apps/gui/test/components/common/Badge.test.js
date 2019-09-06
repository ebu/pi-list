import React from 'react';
import { shallow } from 'enzyme';
import Badge from 'components/common/Badge';
import renderer from 'react-test-renderer';

describe('components/common/Badge', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <Badge text="Hey! It's a test"/>
        );
    });

    describe('Badge Component', () => {
        it('should include a custom className', () => {
            wrapper.setProps({ className: 'custom-classname' });

            expect(wrapper.find('.lst-badge').hasClass('custom-classname')).toBe(true);
        });

        it('should render the children test', () => {
            expect(wrapper.find('.lst-badge').text()).toBe('Hey! It\'s a test');
        });
    });

    describe('Badge Snapshots', () => {
        it('should render a default badge (info) with the correct text', () => {
            const tree = renderer
                .create(<Badge text="Just a badge" />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a info badge with the correct text', () => {
            const tree = renderer
                .create(<Badge text="Just a badge" type="info" />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a warning badge with the correct text', () => {
            const tree = renderer
                .create(<Badge text="Just a badge" type="warning" />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a error badge with the correct text', () => {
            const tree = renderer
                .create(<Badge text="Just a badge" type="danger" />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a success badge with the correct text', () => {
            const tree = renderer
                .create(<Badge text="Just a badge" type="success" />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});
