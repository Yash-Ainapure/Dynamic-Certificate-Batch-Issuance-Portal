import { Router } from 'express';
import project from '../modules/project/project.routes';
import batch from '../modules/batch/batch.routes';
import issuance from '../modules/issuance/issuance.routes';

const router = Router();
router.use('/projects', project);
router.use('/batches', batch);
router.use('/issuance', issuance);
export default router;
