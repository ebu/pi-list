import React from 'react';
import { shallow } from 'enzyme';
import Icon from 'components/common/Icon';

describe('components/common/Alert', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = shallow(
            <Icon value="icon test" />
        );
    });

    describe('Icon Component', () => {
        it('should include a custom className', () => {
            wrapper.setProps({ className: 'custom-classname' });

            expect(wrapper.find('.lst-icons').hasClass('custom-classname')).toBe(true);
        });
    });

    it('should include a custom className', () => {
        wrapper.setProps({ className: 'custom-classname' });

        expect(wrapper.find('i').text()).toBe('icon_test');
    });
});
