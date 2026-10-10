import React, { forwardRef, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Box,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { APP_MODAL_MENU_Z_INDEX } from '@/shared/layout/appShellConstants';

export interface SelectWithSearchOption<T = string | number> {
  label: string;
  value: T;
}

interface SelectWithSearchFieldProps<T = string | number> {
  name: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SelectWithSearchOption<T>[];
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

const menuItemSx = {
  display: 'block',
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
};

const SelectWithSearchFieldMUI = <T extends string | number>(
  {
    name,
    label,
    value,
    onChange,
    options,
    error,
    helperText,
    disabled = false,
  }: SelectWithSearchFieldProps<T>,
  ref: React.Ref<HTMLSelectElement>
) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const fieldRef = useRef<HTMLDivElement>(null);
  const [menuWidth, setMenuWidth] = useState<number>();

  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

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
            error={!!error}
            sx={{
              ...theme.customStyleForm.uniformFieldHeight,
              minWidth: 0,
              maxWidth: '100%',
            }}
          >
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              id={name}
              name={name}
              fullWidth
              value={(value as any) ?? ''}
              onChange={(e) => onChange(e.target.value as T)}
              onOpen={syncMenuWidth}
              input={<OutlinedInput label={label} />}
              inputRef={ref}
              label={label}
              disabled={disabled}
              sx={{
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                '& .MuiOutlinedInput-root': {
                  width: '100%',
                  minWidth: 0,
                  maxWidth: '100%',
                },
                '& .MuiSelect-select': {
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                },
              }}
              renderValue={(selected) => {
                const labelText =
                  options.find((opt) => opt.value === selected)?.label ??
                  String(selected ?? '');
                return labelText;
              }}
              onClose={() => setSearch('')}
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
                <MenuItem key={opt.value} value={opt.value} sx={menuItemSx}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Tooltip>
      {(error || helperText) && (
        <FormHelperText error={!!error}>{error ?? helperText}</FormHelperText>
      )}
    </>
  );
};

export default forwardRef(SelectWithSearchFieldMUI);
