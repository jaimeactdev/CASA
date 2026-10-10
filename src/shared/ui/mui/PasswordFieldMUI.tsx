'use client';

import React, { forwardRef, useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  Box,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface PasswordFieldProps {
  name: string;
  value: string;
  label?: string;
  smallText?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  maxlenght?: number;
   startIcon?: React.ReactNode; 
}

const PasswordFieldMUI = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      name,
      value,
      label = '',
      smallText = '',
      onChange,
      onBlur,
      error,
      disabled = false,
      maxlenght = 2000,
      startIcon,
    },
    ref
  ) => {
    const theme = useTheme();
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    return (
      <>
       <Box
          display="flex"
          alignItems="center"
          
          sx={{
            '&:focus-within .icon-box': {
              borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
              borderWidth: '2px',
            },
           
             '&:hover .icon-box': {
              borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
               borderWidth: '2px',
            },
            
          }}
        >
          {startIcon && (
            <Box
              className="icon-box"
              sx={{
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: disabled ? '#f5f5f5' : '#fff',
              

                border: error ? '2px solid' : '1.5px solid',
                borderColor: error ? theme.palette.error.main : '#c4c4c4',
                borderRight: 'none',
                borderRadius: '20px 0 0 20px',
                px: 1.5,
                 color: theme.palette.grey[500],
                 
              }
            
            
            }
            >
              {startIcon}
            </Box>
          )}

        <TextField
          inputRef={ref}
          id={name}
          name={name}
          fullWidth
          type={showPassword ? 'text' : 'password'}
          label={label}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          error={!!error}
          disabled={disabled}
          autoComplete="off"
          variant="outlined"
          inputProps={{ maxLength: maxlenght }}
          sx={{
            ...theme.customStyleForm.uniformFieldHeight,
            '& .MuiOutlinedInput-root': {
              ...(theme.customStyleForm.uniformFieldHeight?.['& .MuiOutlinedInput-root'] ?? {}),
              borderRadius: startIcon ? '0 20px 20px 0' : '20px',
              // Fondo para estado deshabilitado
      '&.Mui-disabled': {
        backgroundColor: '#f5f5f5', // color que quieras
      }
            },
            '& .MuiOutlinedInput-notchedOutline': {
              ...(theme.customStyleForm.uniformFieldHeight?.['& .MuiOutlinedInput-notchedOutline'] ?? {}),
              borderLeft: startIcon ? 'none' : undefined,
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={toggleVisibility}
                  onMouseDown={(e) => e.preventDefault()}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
         </Box>

        {error ? (
          <FormHelperText error>{error}</FormHelperText>
        ) : (
          smallText && <FormHelperText>{smallText}</FormHelperText>
        )}
        
      </>
    );
  }
);

PasswordFieldMUI.displayName = 'PasswordFieldMUI';

export default PasswordFieldMUI;
