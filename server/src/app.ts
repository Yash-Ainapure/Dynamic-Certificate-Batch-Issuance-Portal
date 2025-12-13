import express from 'express';
import cors from 'cors';
import { json, urlencoded } from 'express';
import router from './routes/index';
import { errorHandler } from './core/errors/errorHandler';
import { requestLogger } from './core/middlewares/logger';

const app = express();

app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));
app.use(requestLogger);

app.use('/api', router);

app.use(errorHandler);

export default app;
