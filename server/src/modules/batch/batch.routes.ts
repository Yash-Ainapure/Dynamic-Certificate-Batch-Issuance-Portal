import { Router } from 'express';
import { BatchController } from './batch.controller';
import { upload } from '../../core/middlewares/upload';

const r = Router();
r.post('/upload', upload.single('zip'), BatchController.upload);
export default r;
