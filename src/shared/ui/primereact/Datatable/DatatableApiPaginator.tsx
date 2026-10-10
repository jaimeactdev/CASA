import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnProps } from 'primereact/column';
import { InputText } from "primereact/inputtext";

import { Dialog } from "primereact/dialog";
import debounce from 'lodash/debounce';
import { MultiSelect } from "primereact/multiselect";
import { exportTableToExcel } from "@/shared/utils/excelExport";
import { Calendar } from 'primereact/calendar';
import { Box } from "@mui/material";
import { colors } from "@/styles/designTokens";
import { Button, IconButton, Tooltip } from '@mui/material';
import { DataTableCellText } from "./datatableColumnUi";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';

/** Evita un `[]` nuevo en cada render cuando no se pasa `collapsibleColumns`. */
const EMPTY_COLLAPSIBLE_COLUMNS: any[] = [];

const columnsDefinitionEquals = (a: any[], b: any[]) =>
  a.length === b.length &&
  a.every(
    (col, i) =>
      col?.field === b[i]?.field &&
      col?.header === b[i]?.header &&
      Boolean(col?.collapsible) === Boolean(b[i]?.collapsible),
  );

interface CollapsibleColumn {
    header: string;
    previusCharacter?: string;
    format?: string;
    // string (no keyof): en ternarios mobile/desktop TS ensancha literales a string.
    field: string;
}


interface GenericTableProps<T> {
    isMobile: boolean;
    data: T[];
    rows: number
    columns: Array<ColumnProps & { maxLength?: number, body?: (rowData: T) => React.ReactNode }>;
    filters: { [K in keyof T]?: { value: any } };
    collapsibleColumns?: CollapsibleColumn[];
    expandedRows: any[];
    onRowToggle: (e: any) => void;
    setFilters: React.Dispatch<React.SetStateAction<{ [K in keyof T]?: { value: any } }>>;
    fetchFilteredData: (params: Record<string, any>, filters: any) => void;
    mapFiltersToParams: (filters: { [K in keyof T]?: { value: any } }, globalFilter: string) => Record<string, any>;
    globalFilter: string;
    setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
    showEditButton?: boolean;  // Nueva propiedad
    onEditButtonClick?: (rowData: T) => void;
    totalRecords: number;
}

const DatatableApiPaginator = <T extends object>({
    isMobile,
    data,
    columns,
    filters,
    collapsibleColumns = EMPTY_COLLAPSIBLE_COLUMNS,
    expandedRows,
    onRowToggle,
    setFilters,
    fetchFilteredData,
    mapFiltersToParams,
    globalFilter,
    showEditButton = false, 
    onEditButtonClick, 
    totalRecords,
}: GenericTableProps<T>) => {

  
    const allColumns = useMemo(() => [
        ...columns, 
        ...collapsibleColumns.map(col => ({
          field: col.field,
          header: col.header,
          collapsible: true
        }))
      ], [columns, collapsibleColumns]);
    
    const [dialogContent, setDialogContent] = useState<string | null>(null);
    const [dialogVisible, setDialogVisible] = useState<boolean>(false);
    const [focusedField, setFocusedField] = useState<keyof T | null>(null);
    const [dialogHeader, setDialogHeader] = useState<string | null>(null);
    const [sortableState, setSortableState] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(false);
 
   
    const [selectedColumns, setSelectedColumns] = useState<any>(allColumns);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const safeData = useMemo<T[]>(() => {
      const maybeArray = (data as any)?.data;
      if (Array.isArray(data)) return data as T[];
      if (Array.isArray(maybeArray)) return maybeArray as T[];
      return [];
    }, [data]);
    const totalAll = useMemo<number>(() => {
      const fromProp = (typeof (totalRecords as any) === 'number') ? (totalRecords as number) : undefined;
      const fromDataObj = (data as any)?.totalRecords;
      return (fromProp ?? fromDataObj ?? safeData.length) as number;
    }, [totalRecords, data, safeData.length]);

    useEffect(() => {
        setSelectedColumns((prev: any[]) => {
            const updatedSelectedColumns = prev.filter((col: any) =>
                allColumns.some((colOption: any) => colOption.field === col.field),
            );
            return columnsDefinitionEquals(prev, updatedSelectedColumns)
                ? prev
                : updatedSelectedColumns;
        });
    }, [allColumns]); 

    
    useEffect(() => {}, [selectedColumns]);

    useEffect(() => {

        console.log("filters es ", filters);

    }, [filters]);

     useEffect(() => {

    }, [focusedField]);

   

    useEffect(() => {
        setSelectedColumns((prev: any[]) =>
            columnsDefinitionEquals(prev, allColumns) ? prev : allColumns,
        );
    }, [isMobile, allColumns]);


    const handleColumnToggle = (selectedColumns: Array<ColumnProps & { collapsible?: boolean }>) => {

        setSelectedColumns(selectedColumns);
    };
    
    const ColumnToggleMultiSelect = () => {
        return (
            <MultiSelect
                value={selectedColumns}
                options={allColumns}
                optionLabel="header"
                placeholder="Seleccione columnas"
                onChange={(e) => { console.log(e.value);  handleColumnToggle(e.value)} }
                display="chip"
                style={{ width: isMobile ? '20em' : '40em' }}
            />
        );
    };

        // 1. Función para obtener datos sin debounce
      const fetchData = useCallback(
        async (currentFilters: { [K in keyof T]?: { value: any } }, currentGlobalFilter: string) => {
          setLoading(true);
          const params = {
            ...mapFiltersToParams(currentFilters, currentGlobalFilter),
            pageNumber,
            pageSize
          };
          await fetchFilteredData(params, currentFilters);
          setLoading(false);
        },
        [mapFiltersToParams, fetchFilteredData, pageNumber, pageSize]
      );
    
      // 2. Crear el debounce una sola vez con useMemo
      const debouncedFetchData = useMemo(
        () => debounce(fetchData, 500), // 500ms de espera
        [fetchData] // Solo recrear cuando fetchData cambie
      );
    
      // 3. Efecto para llamar a la función debounceada
      useEffect(() => {
        debouncedFetchData(filters, globalFilter);
        
        // Limpieza al desmontar o cuando cambian las dependencias
        return () => {
          debouncedFetchData.cancel();
        };
      }, [filters, globalFilter, debouncedFetchData]);
    
      // 4. Modificar handleFilterChange para manejar el estado inmediatamente
      const handleFilterChange = (field: keyof T, value: string) => {
        // Actualizar el estado inmediatamente (para mostrar en UI)
        setFilters((prevFilters) => ({
          ...prevFilters,
          [field]: { ...prevFilters[field], value },
        }));
        
        // El efecto con debounce se encargará de la petición después
      };

    
    const visibleCollapsibleColumns = useMemo(() => {
        return collapsibleColumns.filter(col => 
            selectedColumns.some((selectedCol: any) => selectedCol.field === col.field)
        );
    }, [collapsibleColumns, selectedColumns]);

    const rowExpansionTemplate = useCallback((rowData: T) => (
        <div className="p-3">
            {visibleCollapsibleColumns.map((col) => (
                <div key={col.field as string}>
                    <strong>{col.header}: </strong>
                    <span>
                        {typeof rowData[col.field as keyof T] === 'string' || typeof rowData[col.field as keyof T] === 'number'
                            ? `${col.previusCharacter || ''}${col.format ? aplFormat(col.format, String(rowData[col.field as keyof T])) : String(rowData[col.field as keyof T])}`
                            : null}
                    </span>
                </div>
            ))}
        </div>
    ), [visibleCollapsibleColumns]);

    
  

    const handleFilterChangeDate = (field: keyof T, value: { from?: Date; to?: Date }) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [field]: { value }, // Guarda el rango de fechas en el estado
        }));
    };

    const handleFocus = (field: keyof T) => {
        setFocusedField(field);
        setSortableState(prevState => ({ ...prevState, [field]: false }));
    };

    const handleBlur = (field: any) => {
        setFocusedField(null);
        setSortableState(prevState => ({ ...prevState, [field]: true }));
    };


    const handleShowDialog = (content: string, header: string) => {
        setDialogHeader(header);
        setDialogContent(content);
        setDialogVisible(true);
    };

 

    const headerWithFilter = (
        field: keyof T,
        placeholder: string,
        showInput?: boolean,
        widthFilter?: number,
        typeFilter?: string,
        values?: string[]
    ) => {
        
        if (typeFilter === "date") {
            return (
                <div className="p-d-flex p-ai-center">
                      <span style={{ fontWeight: 500, paddingLeft: 7}}>{placeholder}</span>
                     

                    <div className="p-inputgroup">   
                    <Calendar
                        value={filters[field]?.value?.from || null}
                        onChange={(e) => handleFilterChangeDate(field as keyof T, { ...filters[field]?.value, from: e.value })}
                        placeholder="Desde"
                        dateFormat="dd/mm/yy"
                    />
                    <Calendar
                        value={filters[field]?.value?.to || null}
                        onChange={(e) => handleFilterChangeDate(field as keyof T, { ...filters[field]?.value, to: e.value })}
                        placeholder="Hasta"
                        dateFormat="dd/mm/yy"
                    /> 
                    </div>
            </div>
            );
        }

        if (typeFilter === "multiselect") {

            return (
                <div className="p-d-flex p-ai-center">
                      <span style={{ fontWeight: 500, paddingLeft: 7}}>{placeholder}</span>
                     

                    <div className="p-inputgroup">   
                  <MultiSelect
                    value={filters[field]?.value || []} // Valores seleccionados
                    options={values?.map((val) => ({ label: val, value: val })) || []} // Opciones del MultiSelect
                    onChange={(e) => handleFilterChange(field, e.value)} // Manejo del cambio
                    placeholder={`Seleccione ${placeholder}`}
                    display="chip" // Opcional: muestra las opciones seleccionadas como chips
                  />
                  </div>
                </div>
              );
        }
    
        // Caso por defecto (InputText)
        return (
            <div className="p-d-flex p-ai-center">
                <span style={{ fontWeight: 500, paddingLeft: 7}}>{placeholder}</span>
                <br />
                <InputText
                    style={{
                        display: showInput ? "block" : "none",
                        width: widthFilter ? `${widthFilter}em` : "10em",
                    }}
                    value={filters[field]?.value || ""}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                   
                    className="p-ml-2"
                    onFocus={() => handleFocus(field)}
                    onBlur={() => handleBlur(field)}
                />
            </div>
        );
    };
    
    
    const exportExcel = () => {
        void exportTableToExcel(selectedColumns, safeData);
    };

      
    const aplFormat = (type: string, value: any) => {

       
        if(type.trim() ==="formatNumber") {
            
            return !isNaN(Number(value)) ? Number(value).toLocaleString('es-ES') : value;

        } else if(type.trim() ==="longDate") {
            
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${day}/${month}/${year} ${hours}:${minutes}`;
            }
            return value; 

        } else if(type.trim() ==="longDate2") {
            
            
            const date = new Date(value);
            if (!isNaN(date.getTime())) {

                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();

                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const period = hours >= 12 ? 'PM' : 'AM';

                hours = hours % 12 || 12;

                return `${day}/${month}/${year} ${hours}:${minutes} ${period}`;
            }
            return value;

        } else if(type.trim() ==="shortDate") {
            
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            }
            return value; 
        } else

        return '0';
    };


  

        const header = (
        <Box
            sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
            }}
        >
            <span style={{ fontWeight : 200 }}>Total de registros: {totalAll}</span>
            <ColumnToggleMultiSelect />
           <Button  sx={{ textTransform: 'none' }}
                variant="outlined"
                startIcon={<SearchOffIcon />}
                onClick={() => {
                    setFilters({});
                    fetchFilteredData({}, {});
                }}
                >
                Limpiar filtros
                </Button>

                <Tooltip title="Exportar a Excel">
                <IconButton
                    color="success"
                    onClick={exportExcel}
                >
                    <FileDownloadIcon />
                </IconButton>
                </Tooltip>
        </Box>
        );

    
    const getNestedValue = (path: string, obj: any): any => {
        return path.split('.').reduce((acc, key) => {
            
            const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
    
            if (arrayMatch) {
                const [, arrayKey, index] = arrayMatch; 
                return acc && acc[arrayKey] && acc[arrayKey][Number(index)];
            }
            return acc && acc[key];
        }, obj);
    };

    console.log("data es ", safeData);

    return (
       <div style={{ overflowX: 'auto' }}>
            <DataTable value={safeData} 
            paginator scrollable
            lazy
            totalRecords={totalAll}
            scrollHeight="flex"
            rows={pageSize}
            first={(pageNumber - 1) * pageSize}
            onPage={(e) => {
              const currentPage = (typeof e.page === 'number') ? e.page : Math.floor(e.first / e.rows);
              const nextPageNumber = currentPage + 1;
              const nextPageSize = e.rows;
              setPageNumber(nextPageNumber);
              setPageSize(nextPageSize);
              const params = {
                ...mapFiltersToParams(filters, globalFilter),
                pageNumber: nextPageNumber,
                pageSize: nextPageSize
              };
              fetchFilteredData(params, filters);
            }}
            responsiveLayout="scroll" 
            header={header} 
            expandedRows={expandedRows}
            onRowToggle={onRowToggle}
            loading={loading}
            rowsPerPageOptions={[10, 20, 50, 100]}
            emptyMessage="No se encontraron registros" 
            rowExpansionTemplate={rowExpansionTemplate}
                >
                  {collapsibleColumns.length > 0 && <Column expander style={{ width: '3em' }} />}
                  {showEditButton && (
                 <Column
                    header=""
                    body={(rowData: T) => (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Editar">
                            <IconButton
                            onClick={() => onEditButtonClick?.(rowData)}
                            sx={{
                                backgroundColor: colors.brand,
                                color: colors.textPositive,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                backgroundColor: colors.brandPress,
                                },
                            }}
                            >
                            <EditIcon />
                            </IconButton>
                        </Tooltip>
                        </Box>
                    )}
                     style={{ width: '50px', minWidth: '50px' }}
                    />
            )}

                  {selectedColumns
                    .filter((col: any) => !col.collapsible) 
                    .map((col : any, index: any) => (
                     
                        <Column bodyStyle={{ textAlign: col.alignText ?   col.alignText : 'left' }}
                            key={index}
                            sortable={ col.sortable ? ( sortableState[col.field] !== false)  : false} 

                             style={{ width: col.columnWidth || '12em', minWidth: '12em' }}

                            field={col.field}
                            header={headerWithFilter(col.field, col.header as string, col.filter ,col.withFilter, col.typeFilter, col.values )}
                            body={(rowData: T) => {
                             
                                const cellValue = getNestedValue(col.field, rowData) ?? '';
                                const displayValue = String(cellValue);

                                if (col.maxLength && displayValue.length > col.maxLength) {
                                    return (
                                        <div >
                                            {displayValue.substring(0, col.maxLength) + '... '}
                                            <a className="verMasLink" href="#" onClick={(e) => {
                                                e.preventDefault();
                                                handleShowDialog(displayValue, col.header as string);
                                            }} >Ver más...</a>
                                        </div>
                                    );
                                } else {

                                    const displayValue2= col.format && displayValue ? aplFormat(col.format, displayValue)  :  displayValue;

                                    const finalText = col.previusCharacter ? (displayValue2 ? col.previusCharacter+displayValue2 : displayValue2) : '' +displayValue2;
                                    return <DataTableCellText>{finalText}</DataTableCellText>;
                                }
                            }}
                        />
                    ))}

              
            </DataTable>
            <Dialog header={dialogHeader} visible={dialogVisible} style={{ width: '50vw' }} dismissableMask={false} onHide={() => setDialogVisible(false)}>
                <p>{dialogContent}</p>
            </Dialog>
        </div>
    );
};

export default DatatableApiPaginator;
