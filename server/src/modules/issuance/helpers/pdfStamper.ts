import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';

export async function stampPdf(buf: Buffer, x: number, y: number, qrText: string) {
  const pdfDoc = await PDFDocument.load(buf);
  const page = pdfDoc.getPage(0);

  // Generate QR code PNG buffer
  const qrPngBuffer: Buffer = await QRCode.toBuffer(qrText, {
    type: 'png',
    margin: 0,
    width: 256,
    errorCorrectionLevel: 'M',
  });

  const pngImage = await pdfDoc.embedPng(qrPngBuffer);
  // Reasonable default size; coordinates are exact placement (bottom-left origin)
  const qrWidth = 120;
  const qrHeight = 120;

  page.drawImage(pngImage, {
    x,
    y,
    width: qrWidth,
    height: qrHeight,
  });

  const out = await pdfDoc.save();
  return Buffer.from(out);
}
