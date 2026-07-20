/**
 * Shared export utilities for PDF and Excel generation.
 * Consolidates duplicate export logic from inventory and sales modules.
 */

// =============================================================================
// TYPES
// =============================================================================

export type ExportColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | null;
};

export type ExportConfig<T> = {
  title: string;
  filename: string;
  sheetName: string;
  columns: ExportColumn<T>[];
  data: T[];
};

// =============================================================================
// PDF EXPORT
// =============================================================================

/**
 * Generate and download a PDF file with tabular data.
 */
export async function exportToPdf<T>(config: ExportConfig<T>): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();

  // Add title
  doc.text(config.title, 14, 15);

  // Prepare table data
  const headers = config.columns.map((col) => col.header);
  const rows = config.data.map((row) =>
    config.columns.map((col) => col.accessor(row) ?? "")
  );

  // Generate table
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20,
  });

  // Save file
  doc.save(`${config.filename}.pdf`);
}

// =============================================================================
// EXCEL EXPORT
// =============================================================================

/**
 * Generate and download an Excel file with tabular data.
 */
export async function exportToExcel<T>(config: ExportConfig<T>): Promise<void> {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");

  // Prepare rows with headers
  const headers = config.columns.map((col) => col.header);
  const rows = config.data.map((row) =>
    config.columns.map((col) => col.accessor(row) ?? "")
  );

  await writeXlsxFile([headers, ...rows], {
    sheet: config.sheetName,
  }).toFile(`${config.filename}.xlsx`);
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Create an export configuration for simple data.
 */
export function createExportConfig<T>(
  title: string,
  filename: string,
  sheetName: string,
  columns: ExportColumn<T>[],
  data: T[],
): ExportConfig<T> {
  return { title, filename, sheetName, columns, data };
}

/**
 * Format a date for export (Indonesian locale).
 */
export function formatDateForExport(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a datetime for export (Indonesian locale).
 */
export function formatDateTimeForExport(date: Date | string): string {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
