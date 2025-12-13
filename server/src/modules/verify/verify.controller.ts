import { Request, Response } from 'express';
import { prisma } from '../../config/database';

export const VerifyController = {
  async get(req: Request, res: Response) {
    try {
      const certId = req.params.certId;
      if (!certId) {
        return res.status(400).send('certId is required');
      }
      const cert = await prisma.certificate.findUnique({ where: { id: certId } });
      if (!cert) {
        return res.status(404).send('Certificate not found');
      }
      if (!cert.finalPdfUrl) {
        return res.status(409).send('Certificate not issued yet');
      }
      return res.redirect(302, cert.finalPdfUrl);
    } catch (err) {
      console.error('Verify error:', err);
      return res.status(500).send('Failed to verify certificate');
    }
  },
};
