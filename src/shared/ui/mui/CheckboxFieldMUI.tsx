import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface CheckboxFieldMUIProps {
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  label?: string | React.ReactNode;
  disabled?: boolean;
}

const CheckboxFieldMUI: React.FC<CheckboxFieldMUIProps> = ({
  name,
  checked,
  onChange,
  error,
  label,
  disabled = false,
}) => {
  const theme = useTheme();

  return (
    <FormControl
      component="fieldset"
      error={!!error}
      sx={theme.customStyleForm.checkboxField} // Tu estilo centralizado
    >
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
          />
        }
        label={
          typeof label === 'string'
            ? <span style={{ textAlign: 'justify'}}>{label}</span>
            : label
        }
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

CheckboxFieldMUI.displayName = 'CheckboxFieldMUI';
export default CheckboxFieldMUI;
