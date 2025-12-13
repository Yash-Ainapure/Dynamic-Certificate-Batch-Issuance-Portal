import { Router } from 'express';
import project from '../modules/project/project.routes';
import batch from '../modules/batch/batch.routes';
import issuance from '../modules/issuance/issuance.routes';
import verify from '../modules/verify/verify.routes';

const router = Router();
router.use('/projects', project);
router.use('/batches', batch);
router.use('/issuance', issuance);
router.use('/verify', verify);
export default router;
