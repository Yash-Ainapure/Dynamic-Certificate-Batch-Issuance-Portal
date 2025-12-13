import { Router } from 'express';
import { BatchController } from './batch.controller';
import { upload } from '../../core/middlewares/upload';

const r = Router();
r.post('/upload', upload.single('zip'), BatchController.upload);
r.get('/', BatchController.list); // expects query: projectId, limit?, cursor?
r.get('/:batchId', BatchController.get);
r.get('/:batchId/certificates', BatchController.listCertificates); // query: status?, limit?, cursor?
r.post('/:batchId/retry-failed', BatchController.retryFailed);
r.delete('/:batchId', BatchController.delete);
r.get('/:batchId/download', BatchController.download);

export default r;
