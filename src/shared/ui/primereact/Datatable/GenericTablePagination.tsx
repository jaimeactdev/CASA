import React, { useState, useCallback, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnProps } from 'primereact/column';
import { InputText } from "primereact/inputtext";
import { Button, IconButton, Tooltip } from "@mui/material";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import EditIcon from "@mui/icons-material/Edit";
import { Dialog } from "primereact/dialog";
import debounce from 'lodash/debounce';
import { MultiSelect } from "primereact/multiselect";
import { exportTableToExcel } from "@/shared/utils/excelExport";
import { Calendar } from 'primereact/calendar';
import { Box } from "@mui/material";
import { colors } from "@/styles/designTokens";
import { DataTableCellText } from "./datatableColumnUi";

/** Evita un `[]` nuevo en cada render cuando no se pasa la prop. */
const EMPTY_COLLAPSIBLE_COLUMNS: any[] = [];
const EMPTY_WRAP_FIELDS: string[] = [];

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
    columns: Array<ColumnProps & { maxLength?: number, body?: (rowData: T) => React.ReactNode, minWidth?: number, width?: number }>;
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
    first: number;
   
    onPageChange: (event: { first: number; rows: number }) => void;
    loading: boolean
    setLoading: (e: any) => void; 
    showColumnToggleMultiSelect?: boolean;
    wrapFields?: string[];
}

const GenericTablePagination = <T extends object>({
    isMobile,
    data,
    rows,
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
    first,
    onPageChange,
    loading,
    setLoading,
    showColumnToggleMultiSelect = true,
    wrapFields = EMPTY_WRAP_FIELDS
}: GenericTableProps<T>) => {

   /* console.log("first (start index):", first);
    console.log("Rows Generic:", rows); // Debería imprimir 50
    console.log("Total records Generic:", totalRecords); // Debería imprimir 264*/
    const totalAll = useMemo(() => {
        const tr = typeof totalRecords === 'number' ? totalRecords : 0;
        return tr > 0 ? tr : (Array.isArray(data) ? data.length : 0);
    }, [totalRecords, data]);

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
   // const [loading, setLoading] = useState<boolean>(false);
    
    useEffect(() => {
       
    }, [focusedField]);
    
    const [selectedColumns, setSelectedColumns] = useState<any>(allColumns);
    const sumMinWidths = useMemo(() => {
        return selectedColumns
            .filter((c: any) => !c.collapsible)
            .reduce((acc: number, c: any) => acc + (c?.minWidth ?? 240), 0);
    }, [selectedColumns]);
    const minTableWidth = useMemo(() => {
        const expander = collapsibleColumns.length > 0 ? 60 : 0;
        const editCol = showEditButton ? 100 : 0;
        const paddingAllowance = 48;
        return Math.max(600, sumMinWidths + expander + editCol + paddingAllowance);
    }, [sumMinWidths, collapsibleColumns.length, showEditButton]);

    /*const [filtersDate, setFiltersDate] = useState<{
        [key: string]: { value?: string; fechaInicio?: Date; fechaFin?: Date };
    }>({});*/


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

    

    /*const debouncedFetchFilteredData = useCallback(
        debounce(() => {
            setLoading(true);
            const params = mapFiltersToParams(filters, globalFilter);
            fetchFilteredData(params);
            setLoading(false); 
        }, 500),
        [filters, globalFilter]
    );
    */

    const debouncedFetchFilteredData = useCallback(
        debounce(async () => {
            setLoading(true); // Mostrar el loader antes de la carga
            const params = mapFiltersToParams(filters, globalFilter);
         
            await fetchFilteredData(params, filters);

         
            setLoading(false); // Ocultar el loader después de la carga
        }, 500),
        [filters, globalFilter]
    );
    
    useEffect(() => {
        debouncedFetchFilteredData();
        return debouncedFetchFilteredData.cancel;
    }, [filters, globalFilter, debouncedFetchFilteredData]);

    
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

    
    const handleFilterChange = (field: keyof T, value: string) => {

        setFilters((prevFilters) => ({
            ...prevFilters,
            [field]: { value },
        }));
    };

    /*const handleFilterChangeDate = (field: keyof T, value: any) => {

        console.log("field ", field);
        console.log("value ", value);
        setFilters((prevFilters) => ({
            ...prevFilters,
            [field]: value,
        }));
    };*/

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


    /*onst headerWithFilter = (field: keyof T, placeholder: string, showInput? : boolean, widthFilter? : number, dataType?: string, typeFilter?: string,) => (


       <div className="p-d-flex p-ai-center">
            <span>{placeholder}</span><br />
            
            <InputText style={ { display : (showInput) ? "block" : "none" ,  width: widthFilter ? widthFilter+'em' : '10em' }}
                value={filters[field]?.value || ''}
                onChange={(e) => handleFilterChange(field, e.target.value)}
                placeholder={`${placeholder}`}
                className="p-ml-2"
                onFocus={() => handleFocus(field)}
                onBlur={() => handleBlur(field)}
            />
        </div>
    );*/
 
    

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
                         
                         
    
                        <div className="p-inputgroup">   
                        <Calendar
                            value={filters[field]?.value?.from || null}
                            onChange={(e) => handleFilterChangeDate(field as keyof T, { ...filters[field]?.value, from: e.value })}
                            placeholder= {placeholder +" desde"}  
                            dateFormat="dd/mm/yy"
                            style={{ width: '100%', maxWidth: widthFilter ? `${widthFilter}em` : undefined }}
                            inputStyle={{
                                width: '100%',
                                borderRadius: '0px',
                                border: 'none',
                                borderBottom: '1px solid #ced4da',
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                outline: 'none',
                                paddingLeft: '12px'
                            }}
                        />
                        <span style={{ margin: '0 8px', color: '#6b7280', display: 'inline-block', transform: 'translateY(6px)' }}>→</span>
                        <Calendar
                            value={filters[field]?.value?.to || null}
                            onChange={(e) => handleFilterChangeDate(field as keyof T, { ...filters[field]?.value, to: e.value })}
                            placeholder={placeholder +" hasta"}  
                            dateFormat="dd/mm/yy"
                            style={{ width: '100%', maxWidth: widthFilter ? `${widthFilter}em` : undefined }}
                            inputStyle={{
                                width: '100%',
                                borderRadius: '0px',
                                border: 'none',
                                borderBottom: '1px solid #ced4da',
                                backgroundColor: 'transparent',
                                boxShadow: 'none',
                                outline: 'none',
                                paddingLeft: '12px'
                            }}
                        /> 
                        </div>
                </div>
                );
        }

         if (typeFilter === "multiselect") {
        
                    return (
                        <div className="p-d-flex p-ai-center">
                             {/* <span>{placeholder}</span>*/ }
                             
        
                            <div className="p-inputgroup gtp-multi">   
                          <MultiSelect
                            value={filters[field]?.value || []}
                            options={values?.map((val) => ({ label: val, value: val })) || []}
                            onChange={(e) => handleFilterChange(field, e.value)}
                            placeholder={`${placeholder}`}
                            display="chip"
                            style={{ width: widthFilter ? `${widthFilter}em` : '12em' }}
                          />
                          </div>
                          <style jsx>{`
                            .gtp-multi :global(.p-multiselect-chip) {
                              width: 230px !important;
                            }
                          `}</style>
                        </div>
                      );
            }
    
        // Caso por defecto (InputText)
        return (
            <div className="p-d-flex p-ai-center">
               
                <InputText
                    style={{
                        width: '100%',
                        maxWidth: widthFilter ? `${widthFilter}em` : undefined,
                        borderRadius: '0px',
                        border: 'none',
                        borderBottom: '1px solid #ced4da',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        outline: 'none',
                        paddingLeft: '12px'
                    }}
                    value={filters[field]?.value || ""}
                    onChange={(e) => handleFilterChange(field, e.target.value)}
                    placeholder={'Buscar por ' + placeholder}
                    className="p-ml-2"
                    onFocus={() => handleFocus(field)}
                    onBlur={() => handleBlur(field)}
                />
            </div>
        );
    };
    
    
    const exportExcel = () => {
        void exportTableToExcel(selectedColumns, data);
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
            
            // Formato: DIA/MES/AÑO HH:MM AM/PM
            const date = new Date(value);
            if (!isNaN(date.getTime())) {

                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const year = date.getFullYear();

                let hours = date.getHours();
                const minutes = date.getMinutes().toString().padStart(2, '0');
                const period = hours >= 12 ? 'PM' : 'AM';

                // Convertir horas al formato de 12 horas
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

       isMobile  ? 
       (
        <div className={`${isMobile ? 'headerDatatableMobile' : 'headerDatatableDekstop'} gap-2`}>
          <Button
            sx={{ textTransform: 'none' }}
            variant="outlined"
            startIcon={<SearchOffIcon />}
            onClick={() => setFilters({})}
          >
            Limpiar filtros
          </Button>
          <Tooltip title="Exportar a Excel">
            <IconButton color="success" onClick={exportExcel}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
     ) : (
        <div className={`${isMobile ? 'headerDatatableDekstop' : 'headerDatatableDekstop'} gap-2`}>
          <Button
            sx={{ textTransform: 'none' }}
            variant="outlined"
            startIcon={<SearchOffIcon />}
            onClick={() => setFilters({})}
          >
            Limpiar filtros
          </Button>
          <Tooltip title="Exportar a Excel">
            <IconButton color="success" onClick={exportExcel}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
     )

        
    );


    const getNestedValue = (path: string, obj: any): any => {
        return path.split('.').reduce((acc, key) => acc && acc[key], obj);
    };
   
   

    return (
        <>
            {showColumnToggleMultiSelect && (

                   <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <span style={{ fontWeight : 200 }}>Columnas visibles</span>
              <ColumnToggleMultiSelect />

              
               
            </Box>
          </Box>


              
            )}
            <DataTable 
            value={data} 
            paginator={true} 
            rows={rows} 
            totalRecords={totalAll}
            lazy={true}
            rowsPerPageOptions={[10,20,50,100]}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            currentPageReportTemplate="Página {currentPage} de {totalPages}"
            responsiveLayout="scroll" 
            header={header} 
            first={first} // Multiplica la página actual por el número de filas por página
            tableStyle={{ tableLayout: 'fixed', minWidth: `${minTableWidth}px` }}
            onPage={(event) => {
                console.log("Evento de paginación:", event); // <-- Verifica valores de first y rows
                onPageChange({ first: event.first, rows: event.rows });
            }}
            
           
              expandedRows={expandedRows}
              onRowToggle={onRowToggle}
              loading={loading}
             
            emptyMessage="No se encontraron registros" 
            rowExpansionTemplate={rowExpansionTemplate}
                >
                  {collapsibleColumns.length > 0 && <Column expander style={{ width: '3em' }} />}
                  {showEditButton && (
                    <Column
                        header=""
                        body={(rowData: T) => (
                          <Tooltip title="Editar">
                            <IconButton
                              onClick={() => onEditButtonClick?.(rowData)}
                              sx={{
                                backgroundColor: colors.brand,
                                color: colors.textPositive,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': { backgroundColor: colors.brandPress },
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        style={{ width: '8em' }}
                    />
            )}

                  {selectedColumns
                    .filter((col: any) => !col.collapsible) 
                    .map((col : any, index: any) => (
                     
                        <Column bodyStyle={{ textAlign: col.alignText ?   col.alignText : 'left' }}
                            key={index}
                            sortable={ col.sortable ? ( sortableState[col.field] !== false)  : false} 
                            style={{ width: col.width, minWidth: col.minWidth ?? 240 }}

                            field={col.field}
                            header={headerWithFilter(col.field, col.header as string, col.filter ,col.withFilter, col.typeFilter, col.values )}
                            body={(rowData: T) => {
                               /* const cellValue = rowData[col.field as keyof T] ?? '';
                                const displayValue = String(cellValue);*/

                                const cellValue = getNestedValue(col.field, rowData) ?? '';
                                const displayValue = String(cellValue);

                                if (col.maxLength && displayValue.length > col.maxLength) {
                                    return (
                                        <div>
                                            {displayValue.substring(0, col.maxLength) + '... '}
                                            <a href="#" onClick={(e) => {
                                                e.preventDefault();
                                                handleShowDialog(displayValue, col.header as string);
                                            }}>Ver más</a>
                                        </div>
                                    );
                                } else {

                                    const displayValue2= col.format && displayValue ? aplFormat(col.format, displayValue)  :  displayValue;

                                    const finalText = col.previusCharacter ? (displayValue2 ? col.previusCharacter+displayValue2 : displayValue2) : '' +displayValue2;
                                    const shouldWrap = wrapFields.includes(col.field as string);
                                    return <DataTableCellText wrap={shouldWrap}>{finalText}</DataTableCellText>;
                                }
                            }}
                        />
                    ))}

              
            </DataTable>
            <Dialog header={dialogHeader} visible={dialogVisible} style={{ width: '50vw' }} dismissableMask={false} onHide={() => setDialogVisible(false)}>
                <p>{dialogContent}</p>
            </Dialog>
        </>
    );
};

export default GenericTablePagination;
