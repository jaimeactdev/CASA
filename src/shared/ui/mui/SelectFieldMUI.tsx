import React, { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tooltip,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { APP_MODAL_MENU_Z_INDEX } from '@/shared/layout/appShellConstants';

export interface SelectFieldOption<T = string | number> {
  label: string;
  value: T;
}

interface SelectFieldProps<T = string | number> {
  name: string;
  label: string;
  value: T | '' | null | undefined;
  onChange: (value: T) => void;
  options: SelectFieldOption<T>[];
  error?: string;
  disabled?: boolean;
}

const menuItemSx = {
  display: 'block',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
};

const SelectFieldMUI = <T extends string | number>(
  props: SelectFieldProps<T>,
  ref: React.Ref<HTMLSelectElement>
) => {
  const {
    name,
    label,
    value,
    onChange,
    options,
    error,
    disabled = false,
  } = props;

  const theme = useTheme();
  const fieldRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();

  const selectedLabel = useMemo(() => {
    if (value === '' || value === null || value === undefined) return '';
    return options.find((opt) => opt.value === value)?.label ?? String(value);
  }, [options, value]);

  const syncMenuWidth = () => {
    const width = fieldRef.current?.getBoundingClientRect().width;
    if (width) setMenuWidth(Math.floor(width));
  };

  useLayoutEffect(() => {
    syncMenuWidth();
    const node = fieldRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(syncMenuWidth);
    observer.observe(node);
    window.addEventListener('resize', syncMenuWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', syncMenuWidth);
    };
  }, []);

  return (
    <>
      <Tooltip
        title={selectedLabel}
        disableHoverListener={!selectedLabel}
        enterDelay={400}
      >
        <Box
          ref={fieldRef}
          sx={{
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
            // Keep the floating outlined InputLabel from being clipped.
            overflow: 'visible',
          }}
        >
          <FormControl
            fullWidth
            sx={{
              ...theme.customStyleForm.uniformFieldHeight,
              minWidth: 0,
              maxWidth: '100%',
            }}
            error={!!error}
          >
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              id={name}
              name={name}
              fullWidth
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value as T)}
              onOpen={syncMenuWidth}
              inputRef={ref}
              label={label}
              disabled={disabled}
              renderValue={(selected) => {
                const labelText =
                  options.find((opt) => opt.value === selected)?.label ??
                  String(selected ?? '');
                return labelText;
              }}
              sx={{
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                '& .MuiSelect-select': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                },
              }}
              MenuProps={{
                sx: { zIndex: APP_MODAL_MENU_Z_INDEX },
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    width: menuWidth,
                    maxWidth: menuWidth ?? 'calc(100vw - 48px)',
                    overflowX: 'hidden',
                    zIndex: APP_MODAL_MENU_Z_INDEX,
                  },
                },
                slotProps: {
                  paper: {
                    sx: {
                      zIndex: APP_MODAL_MENU_Z_INDEX,
                      width: menuWidth,
                      maxWidth: 'calc(100vw - 48px)',
                      overflowX: 'hidden',
                    },
                  },
                },
              }}
            >
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={menuItemSx}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Tooltip>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </>
  );
};

export default forwardRef(SelectFieldMUI);
