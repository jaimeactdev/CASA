/**
 * Arreglo vacío estable para props `collapsibleColumns` de componentes DataTable.
 *
 * Importante: debe conservar la misma referencia (misma constante en runtime) para evitar
 * bucles de render cuando el componente interno usa `useEffect`/dependencias basadas en la
 * referencia del arreglo.
 */
const EMPTY_COLLAPSIBLE_COLUMNS_SHARED: any[] = [];

type CollapsibleColumnShape<T> = {
  header: string;
  previusCharacter?: string;
  format?: string;
  field: keyof T;
};

export const emptyCollapsibleColumns = <T>(): CollapsibleColumnShape<T>[] =>
  EMPTY_COLLAPSIBLE_COLUMNS_SHARED as CollapsibleColumnShape<T>[];

