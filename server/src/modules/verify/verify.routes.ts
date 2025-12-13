import { Router } from 'express';
import { VerifyController } from './verify.controller';

const r = Router();

r.get('/:certId', VerifyController.get);

export default r;
