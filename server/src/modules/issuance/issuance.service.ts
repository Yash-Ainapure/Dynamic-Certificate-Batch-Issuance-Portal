import { prisma } from '../../config/database';
import { getZipFileBuffer, inspectZip } from '../batch/helpers/zipExtractor';
import { parseExcel } from '../batch/helpers/excelParser';
import { uploadBufferToS3 } from '../../core/utils/s3Uploader';
import { env } from '../../config/env';
import { s3 } from '../../config/aws-s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { stampPdf } from './helpers/pdfStamper';

async function downloadZipByUrl(zipFileUrl: string): Promise<Buffer> {
  // Expecting format: https://<bucket>.s3.<region>.amazonaws.com/<key>
  const prefix = `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/`;
  if (!zipFileUrl.startsWith(prefix)) {
    throw new Error('UNSUPPORTED_ZIP_URL');
  }
  const key = zipFileUrl.substring(prefix.length);
  const obj = await s3.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  const body = await obj.Body?.transformToByteArray();
  if (!body) throw new Error('ZIP_DOWNLOAD_FAILED');
  return Buffer.from(body);
}

export const IssuanceService = {
  async start(batchId: string) {
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });
    if (!batch) throw new Error('BATCH_NOT_FOUND');
    if (batch.validationStatus !== 'VALID') throw new Error('BATCH_NOT_VALID');
    if (batch.processingStatus !== 'NOT_STARTED') throw new Error('ALREADY_STARTED');

    const project = await prisma.project.findUnique({ where: { id: batch.projectId } });
    if (!project) throw new Error('BATCH_NOT_FOUND');

    // Mark queued
    await prisma.batch.update({
      where: { id: batchId },
      data: { processingStatus: 'QUEUED' as any, queuedAt: new Date() },
    });

    // Process sequentially (inline for now)
    await prisma.batch.update({ where: { id: batchId }, data: { processingStatus: 'PROCESSING' as any, startedAt: new Date() } });

    try {
      const zipBuf = await downloadZipByUrl(batch.zipFileUrl!);
      const zipInfo = inspectZip(zipBuf);
      const excelBuffer = zipInfo.excelBuffer!;
      const rows = parseExcel(excelBuffer);

      // Create certificate records initially with PENDING
      // Build a map for quick lookup by excelCertId
      const createdCerts: { [excelCertId: string]: string } = {};
      for (const r of rows) {
        const cert = await prisma.certificate.create({
          data: {
            batchId: batchId,
            excelCertId: r.excelCertId,
            fileName: r.fileName,
            status: 'PENDING' as any,
          },
        });
        createdCerts[r.excelCertId] = cert.id;
      }

      let processedCount = 0;
      let successCount = 0;
      let failedCount = 0;

      for (const r of rows) {
        const certId = createdCerts[r.excelCertId];
        try {
          // Fetch original PDF from ZIP
          const pdfBuf = getZipFileBuffer(zipBuf, r.fileName);
          if (!pdfBuf) throw new Error('PDF_NOT_FOUND_IN_ZIP');

          // QR content
          if (!certId) throw new Error('CERT_NOT_CREATED');
          const qrText = `http://localhost:4000/api/verify/${certId}`;
          const stamped = await stampPdf(pdfBuf, project.qrX, project.qrY, qrText);
          const finalPdfUrl = await uploadBufferToS3(stamped, 'application/pdf', 'certificates', `${batchId}/${r.excelCertId}.pdf`);

          await prisma.certificate.update({
            where: { id: certId as string },
            data: { status: 'ISSUED' as any, finalPdfUrl, processedAt: new Date() },
          });
          successCount++;
        } catch (e: any) {
          await prisma.certificate.update({
            where: { id: (createdCerts[r.excelCertId] as string) },
            data: { status: 'FAILED' as any, validationError: e?.message || 'PROCESSING_FAILED', processedAt: new Date() },
          });
          failedCount++;
        } finally {
          processedCount++;
          await prisma.batch.update({
            where: { id: batchId },
            data: {
              processedCount,
              successCount,
              failedCount,
            },
          });
        }
      }

      await prisma.batch.update({
        where: { id: batchId },
        data: { processingStatus: 'COMPLETED' as any, finishedAt: new Date() },
      });
    } catch (e) {
      await prisma.batch.update({ where: { id: batchId }, data: { processingStatus: 'FAILED' as any, finishedAt: new Date() } });
      throw e;
    }

    return { started: true };
  },
  async status(batchId: string) {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    return batch;
  },
  async retryFailed(batchId: string) {
    const batch = await prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch) throw new Error('BATCH_NOT_FOUND');
    if (batch.processingStatus === 'PROCESSING' || batch.processingStatus === 'QUEUED') {
      throw new Error('BATCH_PROCESSING');
    }
    if (!batch.zipFileUrl) throw new Error('ZIP_MISSING');

    const project = await prisma.project.findUnique({ where: { id: batch.projectId } });
    if (!project) throw new Error('BATCH_NOT_FOUND');

    // Mark processing for retry window (do not reset counters; we will update increments)
    await prisma.batch.update({ where: { id: batchId }, data: { processingStatus: 'PROCESSING' as any } });

    try {
      const zipBuf = await downloadZipByUrl(batch.zipFileUrl);
      // Fetch FAILED certificates for this batch
      const failedCerts = await prisma.certificate.findMany({
        where: { batchId, status: 'FAILED' as any },
        select: { id: true, excelCertId: true, fileName: true },
        orderBy: { id: 'asc' },
      });

      let processedInc = 0;
      let successInc = 0;
      let failedInc = 0;

      for (const c of failedCerts) {
        try {
          const pdfBuf = getZipFileBuffer(zipBuf, c.fileName);
          if (!pdfBuf) throw new Error('PDF_NOT_FOUND_IN_ZIP');
          const qrText = `http://localhost:3000/verify/${c.id}`;
          const stamped = await stampPdf(pdfBuf, project.qrX, project.qrY, qrText);
          const finalPdfUrl = await uploadBufferToS3(stamped, 'application/pdf', 'certificates', `${batchId}/${c.excelCertId}.pdf`);
          await prisma.certificate.update({
            where: { id: c.id },
            data: { status: 'ISSUED' as any, finalPdfUrl, processedAt: new Date(), validationError: null },
          });
          successInc++;
        } catch (e: any) {
          await prisma.certificate.update({
            where: { id: c.id },
            data: { status: 'FAILED' as any, validationError: e?.message || 'PROCESSING_FAILED', processedAt: new Date() },
          });
          failedInc++;
        } finally {
          processedInc++;
          await prisma.batch.update({
            where: { id: batchId },
            data: {
              processedCount: { increment: 1 },
              successCount: successInc ? { increment: 1 } : undefined,
              failedCount: failedInc ? { increment: 1 } : undefined,
            } as any,
          });
          // Reset inc flags so we only increment once per loop iteration
          successInc = 0;
          failedInc = 0;
        }
      }

      await prisma.batch.update({ where: { id: batchId }, data: { processingStatus: 'COMPLETED' as any, finishedAt: new Date() } });
    } catch (e) {
      await prisma.batch.update({ where: { id: batchId }, data: { processingStatus: 'FAILED' as any, finishedAt: new Date() } });
      throw e;
    }

    return { retried: true };
  },
};
