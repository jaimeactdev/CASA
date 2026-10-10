'use client';


import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText
} from '@mui/material';


export interface RadioOption {
  label: string;
  value: string;
}

interface RadioFieldMUIProps {
  name: string;
  label: string;
  value: string;
  options: RadioOption[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  direction?: 'row' | 'column';
}

const RadioFieldMUI: React.FC<RadioFieldMUIProps> = ({
  name,
  label,
  value,
  options,
  onChange,
  error,
  disabled = false,
  direction = 'row',
}) => {

  const isRow = direction === 'row';

  return (
    <FormControl
      component="fieldset"
      error={!!error}
      sx={{
       
        flexDirection: 'column',
        width: isRow ? 'auto' : '100%',
        height: isRow ? '45px' : 'auto',
        justifyContent: isRow ? 'center' : 'flex-start',
      }}
    >
      <FormLabel
        component="legend"
        sx={{
          fontSize: '12px',
          marginBottom: isRow ? 0 : '10px',
          lineHeight: '1.2',
          display: 'flex',
          alignItems: isRow ? 'center' : 'flex-start',
          height: '15px',
        }}
      >
        {label}
      </FormLabel>

      <RadioGroup
        row={isRow}
        name={name}
        value={value}
        onChange={onChange}
        sx={{
          flexDirection: direction,
          alignItems: isRow ? 'center' : 'flex-start',
          gap: isRow ? '12px' : '6px',
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio disabled={disabled} />}
            label={option.label}
            sx={{
              margin: 0,
              height: isRow ? '45px' : '20px',
              display: 'flex',
              alignItems: 'center',
              '.MuiFormControlLabel-label': {
                fontSize: '15px',
              },
            }}
          />
        ))}
      </RadioGroup>

      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};


RadioFieldMUI.displayName = 'RadioFieldMUI';

export default RadioFieldMUI;
