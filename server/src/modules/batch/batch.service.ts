import { prisma } from '../../config/database';
import { inspectZip } from './helpers/zipExtractor';
import { parseExcel } from './helpers/excelParser';
import { uploadToS3 } from '../../core/utils/s3Uploader';

export const BatchService = {
  async validateAndPersist(projectId: string, file: Express.Multer.File) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new Error('Project not found');
    }

    // 1) Inspect ZIP
    const zipInfo = inspectZip(file.buffer);

    const errors: Array<{
      type:
        | 'INVALID_HEADERS'
        | 'NO_EXCEL'
        | 'MULTIPLE_EXCEL'
        | 'SUBFOLDER_ENTRY'
        | 'DUPLICATE_FILE_IN_ZIP'
        | 'EMPTY_FIELD'
        | 'BAD_FILENAME_FORMAT'
        | 'DUPLICATE_EXCEL_ROW'
        | 'MISSING_FILE'
        | 'EXTRA_FILE';
      message: string;
      rowNumber?: number;
      excelCertId?: string;
      fileName?: string;
    }> = [];

    // Root-level enforcement
    for (const p of zipInfo.invalidPaths) {
      errors.push({ type: 'SUBFOLDER_ENTRY', message: `Entry in subfolder: ${p}` });
    }
    for (const d of zipInfo.duplicates) {
      errors.push({ type: 'DUPLICATE_FILE_IN_ZIP', message: `Duplicate file in ZIP: ${d}` });
    }

    // Excel presence: exactly one
    if (zipInfo.excelFiles.length === 0) {
      errors.push({ type: 'NO_EXCEL', message: 'No Excel file found at root' });
    } else if (zipInfo.excelFiles.length > 1) {
      errors.push({ type: 'MULTIPLE_EXCEL', message: 'Multiple Excel files found; expected exactly one' });
    }

    // Early compute filename set
    const zipPdfSet = new Set(zipInfo.pdfFiles);

    // 2) Parse and validate Excel if present
    let rows: Array<{ excelCertId: string; fileName: string }> = [];
    if (zipInfo.excelBuffer && zipInfo.excelFiles.length === 1) {
      try {
        rows = parseExcel(zipInfo.excelBuffer);
      } catch (e: any) {
        if (e?.message === 'INVALID_HEADERS') {
          errors.push({ type: 'INVALID_HEADERS', message: 'Excel headers must be exactly: excelCertId, fileName' });
        } else {
          errors.push({ type: 'INVALID_HEADERS', message: 'Failed to parse Excel file' });
        }
      }
    }

    // 3) Row-level checks
    const filenameRegex = /^[A-Za-z0-9._-]+\.pdf$/; // no spaces, case-sensitive, ends with .pdf
    const seenCertIds = new Set<string>();
    const seenRowFiles = new Set<string>();

    rows.forEach((r, idx) => {
      const rowNo = idx + 2; // header at row 1
      const certId = r.excelCertId?.trim();
      const fname = r.fileName?.trim();

      if (!certId) {
        errors.push({ type: 'EMPTY_FIELD', message: 'excelCertId is required', rowNumber: rowNo });
      }
      if (!fname) {
        errors.push({ type: 'EMPTY_FIELD', message: 'fileName is required', rowNumber: rowNo });
      }

      if (fname && !filenameRegex.test(fname)) {
        errors.push({ type: 'BAD_FILENAME_FORMAT', message: `Invalid fileName format: ${fname}`, rowNumber: rowNo, fileName: fname });
      }

      if (certId) {
        if (seenCertIds.has(certId)) {
          errors.push({ type: 'DUPLICATE_EXCEL_ROW', message: `Duplicate excelCertId: ${certId}`, rowNumber: rowNo, excelCertId: certId });
      }
        seenCertIds.add(certId);
      }
      if (fname) {
        if (seenRowFiles.has(fname)) {
          errors.push({ type: 'DUPLICATE_EXCEL_ROW', message: `Duplicate fileName in Excel: ${fname}`, rowNumber: rowNo, fileName: fname });
        }
        seenRowFiles.add(fname);
      }

      if (fname && filenameRegex.test(fname) && !zipPdfSet.has(fname)) {
        errors.push({ type: 'MISSING_FILE', message: `PDF referenced in Excel not found in ZIP: ${fname}`, rowNumber: rowNo, fileName: fname });
      }
    });

    // 4) Extra files not referenced by Excel
    const excelFileSet = new Set(rows.map((r) => r.fileName));
    const extraFiles: string[] = [];
    for (const pdf of zipPdfSet) {
      if (!excelFileSet.has(pdf)) {
        extraFiles.push(pdf);
        errors.push({ type: 'EXTRA_FILE', message: `PDF present in ZIP but not listed in Excel: ${pdf}`, fileName: pdf });
      }
    }

    const totalRecords = rows.length;
    const invalid = errors.length > 0;
    const summary = {
      totalRecords,
      validRecords: invalid ? 0 : totalRecords,
      missingFilesCount: errors.filter((e) => e.type === 'MISSING_FILE').length,
      extraFilesCount: extraFiles.length,
      duplicateFilesCount: zipInfo.duplicates.length,
      errors,
      validationStatus: invalid ? 'INVALID' : 'VALID',
    } as const;

    // 5) Persist
    if (invalid) {
      const batch = await prisma.batch.create({
        data: {
          projectId,
          validationStatus: 'INVALID' as any,
          processingStatus: 'NOT_STARTED' as any,
          totalRecords,
          validRecords: 0,
          validationErrors: summary.errors as any,
          missingFilesCount: summary.missingFilesCount,
          extraFilesCount: summary.extraFilesCount,
          duplicateFilesCount: summary.duplicateFilesCount,
        },
      });
      return { batch, summary };
    }

    // Valid: upload ZIP and store
    const zipFileUrl = await uploadToS3(file, 'batches');
    const batch = await prisma.batch.create({
      data: {
        projectId,
        zipFileUrl,
        validationStatus: 'VALID' as any,
        processingStatus: 'NOT_STARTED' as any,
        totalRecords,
        validRecords: totalRecords,
        missingFilesCount: summary.missingFilesCount,
        extraFilesCount: summary.extraFilesCount,
        duplicateFilesCount: summary.duplicateFilesCount,
      },
    });
    return { batch, summary };
  },
  async list(projectId: string, take: number, cursor?: string) {
    const items = await prisma.batch.findMany({
      where: { projectId },
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > take;
    const pageItems = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore ? items[take]?.id : undefined;
    return { items: pageItems, nextCursor };
  },
  async get(batchId: string) {
    return prisma.batch.findUnique({ where: { id: batchId } });
  },
  async listCertificates(batchId: string, status: string | undefined, take: number, cursor?: string) {
    const where: any = { batchId };
    if (status) where.status = status;
    const items = await prisma.certificate.findMany({
      where,
      take: take + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ processedAt: 'desc' as const }, { id: 'desc' as const }],
      select: { id: true, excelCertId: true, fileName: true, status: true, finalPdfUrl: true, validationError: true, processedAt: true },
    });
    const hasMore = items.length > take;
    const pageItems = hasMore ? items.slice(0, take) : items;
    const nextCursor = hasMore ? items[take]?.id : undefined;
    return { items: pageItems, nextCursor };
  },
};
