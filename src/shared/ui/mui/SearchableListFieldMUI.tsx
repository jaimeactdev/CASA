'use client';

import React, { forwardRef, useState, useMemo, useRef, useEffect } from 'react';
import {
  FormControl,
  //InputLabel,
  TextField,
  FormHelperText,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Box,
  Collapse,
  InputAdornment,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface SearchableListOption<T = string | number> {
  label: string;
  value: T;
}

interface SearchableListFieldProps<T = string | number> {
  name: string;
  label: string;
  value: T | '' | null | undefined;
  onChange: (value: T) => void;
  options: SearchableListOption<T>[];
  error?: string;
  placeholder?: string;
  maxHeight?: number;
}

const SearchableListFieldMUI = <T extends string | number>(
  props: SearchableListFieldProps<T>,
  ref: React.Ref<HTMLInputElement>
) => {
  const {
    name,
    label,
    value,
    onChange,
    options,
    error,
    placeholder = "Buscar...",
    maxHeight = 200
  } = props;

  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options from the search string
  const filteredOptions = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  // Label of the selected option
  const selectedLabel = useMemo(
    () => options.find(opt => opt.value === value)?.label || '',
    [options, value]
  );

  // Manejar clic fuera del componente para cerrar la lista
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionSelect = (selectedValue: T) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearch('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearch('');
    }
  };

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
      <FormControl
        fullWidth
        sx={theme.customStyleForm.uniformFieldHeight}
        error={!!error}
      >
        <TextField
          ref={ref}
          name={name}
          label={label}
          value={isOpen ? search : selectedLabel}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? placeholder : selectedLabel || placeholder}
          error={!!error}
          autoComplete="off"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleToggle}
                  edge="end"
                  size="small"
                >
                  {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </InputAdornment>
            ),
            startAdornment: isOpen ? (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ) : null
          }}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      <Collapse in={isOpen}>
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            maxHeight: maxHeight,
            overflow: 'auto',
            mt: 0.5
          }}
        >
          <List dense>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <ListItem key={option.value} disablePadding>
                  <ListItemButton
                    onClick={() => handleOptionSelect(option.value)}
                    selected={option.value === value}
                  >
                    <ListItemText primary={option.label} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No se encontraron resultados" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Collapse>
    </Box>
  );
};

SearchableListFieldMUI.displayName = 'SearchableListFieldMUI';

export default forwardRef(SearchableListFieldMUI);
