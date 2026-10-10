import React, { forwardRef, useMemo, useState } from 'react';
import {
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface MultiSelectOption<T = string | number> {
  label: string;
  value: T;
}

interface MultiSelectWithSearchFieldProps<T = string | number> {
  name: string;
  label: string;
  value: T[];
  onChange: (e: SelectChangeEvent<T[]>) => void;
  options: MultiSelectOption<T>[];
  error?: string;
  disabled?: boolean;
}

const MultiSelectWithSearchFieldMUI = <T extends string | number>(
  {
    name,
    label,
    value,
    onChange,
    options,
    error,
    disabled = false,
  }: MultiSelectWithSearchFieldProps<T>,
  ref: React.Ref<any>
) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

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
        value={value}
        disabled={disabled}
        onChange={onChange}
        input={<OutlinedInput label={label} />}
        inputRef={ref}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as T[]).map((val) => {
              const labelText = options.find((opt) => opt.value === val)?.label || val;
              return (
                <Chip
                  key={val}
                  label={labelText}
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleDelete(val);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  size="small"
                />
              );
            })}
          </Box>
        )}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
            },
          },
          autoFocus: false,
        }}
      >
        <MenuItem disableRipple disableTouchRipple disableGutters>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </MenuItem>
        {filteredOptions.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            <Checkbox checked={value.includes(opt.value)} />
            <ListItemText primary={opt.label} />
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};



export default forwardRef(MultiSelectWithSearchFieldMUI);
