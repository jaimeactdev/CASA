'use client';

import React from 'react';
import {
  Autocomplete,
  Checkbox,
  TextField,
  FormHelperText,
  FormControl,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface SelectFieldOption<T = string | number> {
  label: string;
  value: T;
}

interface MultiSelectAutocompleteFieldProps<T = string | number> {
  name: string;
  label: string;
  value: T[];
  onChange: (value: T[]) => void;
  options: SelectFieldOption<T>[];
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelectAutocompleteField = <T extends string | number>({
  name,
  label,
  value,
  onChange,
  options,
  error,
  placeholder,
  disabled,
}: MultiSelectAutocompleteFieldProps<T>) => {
  const theme = useTheme();

  

  return (
    <FormControl fullWidth margin="none" error={!!error} size="small">
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={options}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, val) => option.value === val.value}
        value={options.filter((o) => value.includes(o.value))}
        onChange={(_, newValue) => {
          onChange(newValue.map((v) => v.value));
        }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              style={{ marginRight: 8 }}
              checked={selected}
              color="primary"
            />
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField
          name={name}
            {...params}
            label={label}
            placeholder={placeholder}
            size="small"
            error={!!error}
          />
        )}
        disabled={disabled}
        sx={theme.customStyleForm.selectFieldMultiMUI}
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

MultiSelectAutocompleteField.displayName = 'MultiSelectAutocompleteField';

export default MultiSelectAutocompleteField;
