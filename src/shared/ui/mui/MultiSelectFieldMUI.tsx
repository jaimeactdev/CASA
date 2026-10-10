import React, { forwardRef } from 'react';
import {
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  FormHelperText,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface MultiSelectOption<T = string | number> {
  label: string;
  value: T;
}

interface MultiSelectFieldProps<T = string | number> {
  name: string;
  label: string;
  value: T[];
  onChange: (e: SelectChangeEvent<T[]>) => void;
  options: MultiSelectOption<T>[];
  error?: string;
  disabled?: boolean;
}

const MultiSelectFieldMUI = <T extends string | number>(
  {
    name,
    label,
    value,
    onChange,
    options,
    error,
    disabled = false,
  }: MultiSelectFieldProps<T>,
  ref: React.Ref<any>
) => {
  const theme = useTheme();

  const handleDelete = (valToRemove: T) => {
    const newValue = value.filter((v) => v !== valToRemove) as T[];
    const fakeEvent = {
      target: {
        name,
        value: newValue,
      },
    } as unknown as SelectChangeEvent<T[]>;

    onChange(fakeEvent);
  };

  return (
    <FormControl fullWidth error={!!error} sx={theme.customStyleForm.uniformFieldHeight}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        multiple
        value={value ?? []}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
       renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as T[]).map((val) => {
              const labelText = options.find((opt) => opt.value === val)?.label || val;
              return (
                <Chip
                  key={val}
                  label={labelText}
                  onDelete={(e) => {
                    e.stopPropagation(); // keep the Select from opening when clicking the X
                    handleDelete(val);
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // keep the menu from focusing/opening
                  size="small"
                />
              );
            })}
          </Box>
        )}

        disabled={disabled}
        inputRef={ref}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
           <Checkbox checked={(value ?? []).includes(opt.value)} />
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

MultiSelectFieldMUI.displayName = 'MultiSelectFieldMUI';


export default forwardRef(MultiSelectFieldMUI);
