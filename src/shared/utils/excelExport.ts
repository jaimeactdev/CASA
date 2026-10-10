import { saveAs } from "file-saver";

export type ExportColumn = {
  field?: string;
  header?: unknown;
  collapsible?: boolean;
};

export type ExportTable = {
  headers: string[];
  rows: string[][];
};

const EXCEL_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const MIN_COLUMN_WIDTH = 10;
const MAX_COLUMN_WIDTH = 60;

/** Regular columns first, then collapsible ones; every cell as text. */
export function buildExportTable<T>(
  columns: ExportColumn[],
  data: T[],
): ExportTable {
  const ordered = [
    ...columns.filter((col) => !col.collapsible),
    ...columns.filter((col) => col.collapsible),
  ];
  const headers = ordered.map((col) => String(col.header || ""));
  const rows = data.map((item) =>
    ordered.map((col) =>
      String(
        col.field ? ((item as Record<string, unknown>)[col.field] ?? "") : "",
      ),
    ),
  );
  return { headers, rows };
}

export async function createExcelBuffer(
  table: ExportTable,
  sheetName = "data",
): Promise<ArrayBuffer> {
  // Loaded on demand so the library stays out of the initial bundle.
  const excelModule = await import("exceljs");
  const ExcelJS = excelModule.default ?? excelModule;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  sheet.addRow(table.headers).font = { bold: true };
  table.rows.forEach((row) => sheet.addRow(row));

  sheet.columns.forEach((column, index) => {
    const longest = Math.max(
      table.headers[index]?.length ?? 0,
      ...table.rows.map((row) => row[index]?.length ?? 0),
    );
    column.width = Math.min(
      Math.max(longest + 2, MIN_COLUMN_WIDTH),
      MAX_COLUMN_WIDTH,
    );
  });

  return (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
}

/** Downloads the visible columns of a table as `<fileName>_export_<timestamp>.xlsx`. */
export async function exportTableToExcel<T>(
  columns: ExportColumn[],
  data: T[],
  fileName = "file",
): Promise<void> {
  try {
    const buffer = await createExcelBuffer(buildExportTable(columns, data));
    saveAs(
      new Blob([buffer], { type: EXCEL_TYPE }),
      `${fileName}_export_${Date.now()}.xlsx`,
    );
  } catch (error) {
    console.error("Excel export failed", error);
  }
}
