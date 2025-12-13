import { Router } from 'express';
import { IssuanceController } from './issuance.controller';

const r = Router();
r.post('/start', IssuanceController.start);
r.get('/status/:batchId', IssuanceController.status);
export default r;
