import React from 'react';
import PropTypes from 'prop-types';
import { OptionsShape } from '../../../common/types/genericTypes';
import { getCurrentOptionLabel } from '../../../common/utils';
import ItemsList from './ItemsList';
import Icons from '../icons';
import { useShowHide } from '../../../common/useShowHide';

const getStyle = width =>
  width && {
    maxWidth: width,
    minWidth: width,
  };

const SelectButton = ({ options, value }) => {
  const currentLabel = getCurrentOptionLabel(options, value);
  return (
    <>
      <span>{currentLabel}</span>
      <Icons.ArrowDown />
    </>
  );
};

SelectButton.propTypes = {
  value: PropTypes.string,
  options: OptionsShape.isRequired,
};

SelectButton.defaultProps = {
  value: null,
};

const DropdownSelect = ({ value, width, className, options, disabled, onChange }) => {
  const { isOpen, onClick, onItemClick, onFocus, onBlur, onMouseOver, onMouseOut } = useShowHide(disabled, onChange);

  const onKeyDown = () => {};

  return (
    <div
      className={`laab-dropdown-select ${className} ${disabled ? 'disabled' : ''}`}
      style={getStyle(width)}
      onBlur={onBlur}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
      onFocus={onFocus}
    >
      <div
        className={`select-button ${isOpen ? 'select-open' : ''}`}
        onClick={onClick}
        role="button"
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <SelectButton options={options} value={value} />
      </div>
      {isOpen && <ItemsList value={value} options={options} onChange={onItemClick} />}
    </div>
  );
};

DropdownSelect.propTypes = {
  value: PropTypes.string,
  width: PropTypes.string.isRequired,
  className: PropTypes.string,
  options: OptionsShape.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired, // Called when value changes, with the value as the only argument
};

DropdownSelect.defaultProps = {
  value: null,
  className: '',
  disabled: false,
};

export default DropdownSelect;
