import React from 'react';
import {
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  FormLabel,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface RadioGroupFieldOption<T = any> {
  label: string;
  value: T;
}

export interface RadioGroupFieldProps<T = any> {
  name: string;
  value: T;
  direction?: 'row' | 'column';
  options: RadioGroupFieldOption<T>[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

const RadioGroupFieldMUI = <T extends string | number>({
  name,
  value,
  direction = 'column',
  options,
  onChange,
  error,
  disabled = false,
  label = '',
}: RadioGroupFieldProps<T>) => {
  const theme = useTheme();

  return (
    <FormControl
      component="fieldset"
      error={!!error}
      sx={direction === 'column' ? theme.customStyleForm.radioCheckboxGroup2 : theme.customStyleForm.radioCheckboxGroup }
    >
      {label && (
      
      <FormLabel  component="legend" sx={{ fontSize: '0.85rem',  color: theme.customTextStyles.floatingText.color, marginBottom: '10px' }}  >
        {label}
      </FormLabel>
      )}

      <RadioGroup
        name={name}
        value={value ?? ''}
        onChange={onChange}
        sx={{
          display: 'flex',
          flexDirection: direction,
          gap: direction === 'column' ? '6px' : '0px',
        }}
      >
        {options.map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio />}
            label={opt.label}
            disabled={disabled}
            sx={{
              ...(direction === 'column' && {
                margin: 0,
                width: '100%',
              }),
            }}
          />
        ))}
      </RadioGroup>

      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default RadioGroupFieldMUI;
