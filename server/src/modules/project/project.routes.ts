import { Router } from 'express';
import { ProjectController } from './project.controller';
import { upload } from '../../core/middlewares/upload';

const r = Router();
r.post('/', upload.single('template'), ProjectController.create);
r.get('/:id', ProjectController.get);
r.get('/', ProjectController.list);
r.delete('/:id', ProjectController.delete);
export default r;
