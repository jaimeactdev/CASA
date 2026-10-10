import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { buildExportTable, createExcelBuffer } from "./excelExport";

const columns = [
  { field: "notes", header: "Notas", collapsible: true },
  { field: "name", header: "Nombre" },
  { field: "fee", header: "Cuota" },
];

const data = [
  { name: "Ana", fee: 24000, notes: "Aguinaldo" },
  { name: "Luis", fee: null, notes: undefined },
];

describe("buildExportTable", () => {
  it("puts regular columns before collapsible ones", () => {
    expect(buildExportTable(columns, data).headers).toEqual([
      "Nombre",
      "Cuota",
      "Notas",
    ]);
  });

  it("turns every cell into text and empty values into blanks", () => {
    expect(buildExportTable(columns, data).rows).toEqual([
      ["Ana", "24000", "Aguinaldo"],
      ["Luis", "", ""],
    ]);
  });

  it("keeps the header row when there is no data", () => {
    expect(buildExportTable(columns, [])).toEqual({
      headers: ["Nombre", "Cuota", "Notas"],
      rows: [],
    });
  });
});

describe("createExcelBuffer", () => {
  it("writes a workbook that reads back with the same cells", async () => {
    const buffer = await createExcelBuffer(buildExportTable(columns, data));

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("data");

    expect(sheet?.getRow(1).values).toEqual([, "Nombre", "Cuota", "Notas"]);
    expect(sheet?.getRow(2).values).toEqual([, "Ana", "24000", "Aguinaldo"]);
    expect(sheet?.getRow(1).font?.bold).toBe(true);
  });
});
