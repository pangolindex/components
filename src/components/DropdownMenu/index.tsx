import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Select, { MenuPlacement, MultiValue, OptionsOrGroups, SingleValue } from 'react-select';
import { ThemeContext } from 'styled-components';

export interface DropdownMenuProps {
  defaultValue: MultiValue<string> | SingleValue<string>;
  onSelect: (value: MultiValue<string> | string) => void;
  placeHolder?: string;
  isMulti?: boolean;
  menuPlacement?: MenuPlacement;
  options: OptionsOrGroups<any, any>;
  height?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  defaultValue,
  onSelect,
  placeHolder,
  isMulti = false,
  menuPlacement,
  options,
  height,
}) => {
  const theme = useContext(ThemeContext);
  const colourStyles = {
    control: (styles) => {
      return {
        ...styles,
        color: theme.color11,
        backgroundColor: theme.color5,
        '&:hover': {
          borderColor: theme.primary,
        },
        ...(height && { height: height }),
      };
    },
    multiValue: (styles) => {
      return {
        ...styles,
        backgroundColor: theme.color5,
        border: `1px solid ${theme.color11}`,
        color: theme.color11,
      };
    },
    multiValueLabel: (styles) => {
      return {
        ...styles,
        color: theme.color11,
      };
    },
    placeholder: (styles) => {
      return {
        ...styles,
        color: theme.color11,
      };
    },
    singleValue: (styles) => {
      return {
        ...styles,
        color: theme.color11,
      };
    },
    input: (styles) => {
      return {
        ...styles,
        color: theme.color11,
      };
    },
    indicatorsContainer: (styles) => {
      return {
        ...styles,
        color: theme.color11,
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
        color: theme.color11,
        backgroundColor: theme.color5,
        cursor: isDisabled ? 'not-allowed' : 'default',
      };
    },
    menuList: (styles) => {
      return {
        ...styles,
        padding: 0,
        color: theme.color11,
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
