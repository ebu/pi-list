import React from 'react';
import { shallow } from 'enzyme';
import Loader from 'components/common/Loader';
import renderer from 'react-test-renderer';

describe('components/common/Loader', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <Loader text="Hey! It's a test"/>
        );
    });

    describe('Loader Component', () => {
        it('should include a custom className', () => {
            wrapper.setProps({ className: 'custom-classname' });

            expect(wrapper.find('.lst-loader').hasClass('custom-classname')).toBe(true);
        });
    });

    describe('Loader Snapshots', () => {
        it('should render a default loader', () => {
            const tree = renderer
                .create(<Loader />)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a mini loader', () => {
            const tree = renderer
                .create(<Loader size="mini"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a small loader', () => {
            const tree = renderer
                .create(<Loader size="small"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a large loader', () => {
            const tree = renderer
                .create(<Loader size="large"/>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});
