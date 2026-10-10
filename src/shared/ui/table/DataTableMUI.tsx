'use client';

import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, Box, 
} from '@mui/material';

type Column<T> = {
  field: keyof T;
  headerName: string;
  collapse?: boolean;     // Ocultar en xs
  filterable?: boolean;
  renderCell?: (row: T) => React.ReactNode;
};

type DataTableMUIProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowsPerPage?: number;
};

function DataTableMUI<T extends { [key: string]: any }>({
  columns,
  rows,
  rowsPerPage = 10,
}: DataTableMUIProps<T>) {
  
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [rowsPerPageState, setRowsPerPageState] = useState(rowsPerPage);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      columns.every((col) => {
        if (!col.filterable) return true;
        const filterValue = filters[col.field as string]?.toLowerCase() || '';
        return row[col.field]
          ?.toString()
          .toLowerCase()
          .includes(filterValue);
      })
    );
  }, [rows, filters, columns]);

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPageState;
    return filteredRows.slice(start, start + rowsPerPageState);
  }, [filteredRows, page, rowsPerPageState]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPageState(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer>
        <Table stickyHeader  sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field as string}
                  sx={col.collapse ? { display: { xs: 'none', sm: 'table-cell' } } : {}}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field as string}
                  sx={col.collapse ? { display: { xs: 'none', sm: 'table-cell' } } : {}}
                >
                  {col.filterable ? (
                    <TextField
                      variant="standard"
                      fullWidth
                      value={filters[col.field as string] || ''}
                      onChange={(e) =>
                        handleFilterChange(col.field as string, e.target.value)
                      }
                      placeholder={`Filtrar ${col.headerName}`}
                    />
                  ) : null}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell
                    key={col.field as string}
                    sx={col.collapse ? { display: { xs: 'none', sm: 'table-cell' } } : {}}
                  >
                    {col.renderCell ? col.renderCell(row) : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredRows.length}
        page={page}
        onPageChange={handleChangePage}
        labelRowsPerPage="Registros por pagina"
        rowsPerPage={rowsPerPageState}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
}

export default DataTableMUI;
