import React from 'react';
import { shallow } from 'enzyme';
import Panel from 'components/common/Panel';
import renderer from 'react-test-renderer';

describe('components/common/Panel', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <Panel>
                Just a panel!
            </Panel>
        );
    });

    describe('Panel Component', () => {
        it('should include a custom className', () => {
            wrapper.setProps({ className: 'custom-classname' });

            expect(wrapper.find('.lst-panel').hasClass('custom-classname')).toBe(true);
        });

        it('should render the correct children', () => {
            expect(wrapper.find('.lst-panel').text()).toBe('Just a panel!');
        });
    });

    describe('Panel Snapshots', () => {
        it('should render a panel with padding', () => {
            const tree = renderer
                .create(<Panel>Just a panel!</Panel>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a panel with no padding', () => {
            const tree = renderer
                .create(<Panel noPadding>Just a panel!</Panel>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });

        it('should render a panel with header', () => {
            const tree = renderer
                .create(<Panel title="test title" noPadding>Just a panel!</Panel>)
                .toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    /*describe('Loader Snapshots', () => {
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
    */
});
