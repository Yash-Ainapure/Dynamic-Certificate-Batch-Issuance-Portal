import * as XLSX from 'xlsx';

export type ExcelRow = { excelCertId: string; fileName: string };

export function parseExcel(buf: Buffer): ExcelRow[] {
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return [];
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];

  // Read with header row preserved
  const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

  // Validate headers strictly
  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  const firstRow = headerRange.s.r;
  const headers: string[] = [];
  for (let c = headerRange.s.c; c <= headerRange.e.c; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: firstRow, c });
    const cell = ws[cellAddr];
    headers.push((cell?.v ?? '').toString());
  }
  const required = ['excelCertId', 'fileName'];
  for (const h of required) {
    if (!headers.includes(h)) {
      throw new Error('INVALID_HEADERS');
    }
  }

  // Map rows to strict shape
  const result: ExcelRow[] = rows.map((r) => ({
    excelCertId: String(r['excelCertId'] ?? '').trim(),
    fileName: String(r['fileName'] ?? '').trim(),
  }));

  return result;
}
