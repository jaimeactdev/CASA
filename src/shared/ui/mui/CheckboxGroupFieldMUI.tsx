import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';


interface CheckboxOption {
  label: string;
  value: string;
}

interface CheckboxGroupFieldProps {
  name: string;
  value: string[];
  options: CheckboxOption[];
  direction?: 'row' | 'column';
  onChange: (value: string[]) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

const CheckboxGroupFieldMUI: React.FC<CheckboxGroupFieldProps> = ({
  name,
  value,
  options,
  direction = 'row',
  onChange,
  error,
  label,
  disabled = false,
}) => {
  const handleCheckboxChange = (checkboxValue: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = event.target.checked;

    const newValue = isChecked
      ? [...value, checkboxValue]
      : value.filter((v) => v !== checkboxValue);

    onChange(newValue);
  };

  const theme = useTheme();


  return (
    <FormControl component="fieldset" error={!!error} sx={theme.customStyleForm.checkboxGroupField}>
      {label && (

         <FormLabel
        component="legend"
        sx={{ fontSize: '0.85rem',  color: theme.customTextStyles.floatingText.color, marginBottom: '0px',  }}
      >
        {label}
      </FormLabel>

       
      )}
      <FormGroup row={direction === 'row'}>
        {options.map((opt) => (
          <FormControlLabel name={name}
            key={opt.value}
            control={
              <Checkbox
                value={opt.value}
                checked={value.includes(opt.value)}
                onChange={handleCheckboxChange(opt.value)}
                disabled={disabled}
              />
            }
            label={opt.label}
          />
        ))}
      </FormGroup>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

CheckboxGroupFieldMUI.displayName = 'CheckboxGroupFieldMUI';

export default CheckboxGroupFieldMUI;
