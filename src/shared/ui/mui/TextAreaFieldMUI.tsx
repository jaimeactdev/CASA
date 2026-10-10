'use client';

import React, { forwardRef } from 'react';
import { TextField, FormHelperText, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface TextAreaFieldProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
  smallText?: string;
  placeholder?: string;
  maxlenght?: number;
  rows?: number;
}

const TextAreaFieldMUI = forwardRef<HTMLInputElement, TextAreaFieldProps>(
  (
    {
      name,
      value,
      onChange,
      onBlur,
      error,
      disabled = false,
      label = '',
      smallText = '',
      placeholder = '',
      maxlenght = 5000,
      rows = 4,
    },
    ref
  ) => {
    const theme = useTheme();
    const remaining = maxlenght - value.length;

    return (
      <>
        <TextField
          inputRef={ref}
          id={name}
          name={name}
          label={label}
          fullWidth
          multiline
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          error={!!error}
          autoComplete="off"
          inputProps={{ maxLength: maxlenght }}
          sx={theme.customStyleForm.uniformFieldHeight}
        />

        <Box
          mt={0.5}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <FormHelperText error={!!error}>
            {error ? error : smallText}
          </FormHelperText>

          <FormHelperText
            sx={{
              fontSize: '0.75rem',
              color: remaining <= 20 ? 'error.main' : 'text.secondary',
            }}
          >
            {remaining} caracteres restantes
          </FormHelperText>
        </Box>
      </>
    );
  }
);

TextAreaFieldMUI.displayName = 'TextAreaFieldMUI';

export default TextAreaFieldMUI;
