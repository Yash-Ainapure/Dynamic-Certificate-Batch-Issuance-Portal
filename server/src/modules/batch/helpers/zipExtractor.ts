export function listZipEntries(_buf: Buffer) {
  // TODO: implement with adm-zip or yauzl
  return [] as string[];
}

import AdmZip from 'adm-zip';

export type ZipInspection = {
  excelFiles: string[];
  pdfFiles: string[];
  duplicates: string[];
  invalidPaths: string[]; // entries inside subfolders
  excelBuffer?: Buffer | undefined;
};

export function inspectZip(buf: Buffer): ZipInspection {
  const zip = new AdmZip(buf);
  const entries = zip.getEntries();

  const seen = new Set<string>();
  const duplicates: string[] = [];
  const excelFiles: string[] = [];
  const pdfFiles: string[] = [];
  const invalidPaths: string[] = [];

  for (const e of entries) {
    if (e.isDirectory) continue;
    const name = e.entryName;
    // Root-only: disallow path separators
    if (name.includes('/') || name.includes('\\')) {
      invalidPaths.push(name);
      continue;
    }
    if (seen.has(name)) {
      duplicates.push(name);
    } else {
      seen.add(name);
    }
    const lower = name.toLowerCase();
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      excelFiles.push(name);
    } else if (lower.endsWith('.pdf')) {
      pdfFiles.push(name);
    }
  }

  let excelBuffer: Buffer | undefined;
  if (excelFiles.length === 1) {
    const entry = zip.getEntry(excelFiles[0]);
    if (entry) {
      excelBuffer = entry.getData();
    }
  }

  return { excelFiles, pdfFiles, duplicates, invalidPaths, excelBuffer };
}
