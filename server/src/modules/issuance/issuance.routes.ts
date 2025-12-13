import { Router } from 'express';
import { IssuanceController } from './issuance.controller';

const r = Router();
r.post('/batches/:batchId/start', IssuanceController.start);
r.get('/batches/:batchId/status', IssuanceController.status);
export default r;
