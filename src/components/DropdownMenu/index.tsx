import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MenuPlacement, MultiValue, OptionsOrGroups, SingleValue } from 'react-select';
import { ThemeContext } from 'styled-components';

export interface DropdownMenuProps {
  defaultValue: MultiValue<string> | SingleValue<string>;
  onSelect: (value: MultiValue<string> | string) => void;
  placeHolder?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  menuPlacement?: MenuPlacement;
  options: OptionsOrGroups<any, any>;
  height?: string;
  width?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  defaultValue,
  onSelect,
  placeHolder,
  isMulti = false,
  isSearchable = false,
  menuPlacement,
  options,
  height,
  width,
}) => {
  const theme = useContext(ThemeContext);
  const colourStyles = {
    control: (styles) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
        backgroundColor: theme.dropdown?.primaryBgColor,
        '&:hover': {
          borderColor: theme.primary,
        },
        ...(height && { height: height }),
        width: width ? width : 'max-content',
      };
    },
    multiValue: (styles) => {
      return {
        ...styles,
        backgroundColor: theme.dropdown?.primaryBgColor,
        border: `1px solid ${theme.dropdown?.color}`,
        color: theme.dropdown?.color,
      };
    },
    multiValueLabel: (styles) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
      };
    },
    placeholder: (styles) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
      };
    },
    singleValue: (styles) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
      };
    },
    input: (styles) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
      };
    },
    indicatorsContainer: (styles) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
      };
    },
    indicatorSeparator: (styles) => {
      return {
        ...styles,
        display: 'none',
      };
    },
    option: (styles, { isDisabled }) => {
      return {
        ...styles,
        color: theme.dropdown?.color,
        backgroundColor: theme.dropdown?.primaryBgColor,
        cursor: isDisabled ? 'not-allowed' : 'default',
      };
    },
    menuList: (styles) => {
      return {
        ...styles,
        padding: 0,
        color: theme.dropdown?.color,
      };
    },
  };

  const { t } = useTranslation();

  return (
    <Select
      options={options}
      onChange={(selectedItems) => {
        onSelect(selectedItems?.value || '');
      }}
      {...(menuPlacement && { menuPlacement })}
      defaultValue={defaultValue}
      placeholder={placeHolder || t('dropdown.select')}
      isMulti={isMulti}
      isSearchable={isSearchable}
      styles={colourStyles}
      theme={(thm) => ({
        ...thm,
        colors: {
          ...thm.colors,
          primary50: theme.primary,
          primary75: theme.primary,
          primary: theme.primary,
        },
      })}
    />
  );
};

export default DropdownMenu;
