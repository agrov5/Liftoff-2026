import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import elementRoutes from './routes/elements';
import compoundRoutes from './routes/compounds';
import lessonRoutes from './routes/lessons';
import authRoutes from './routes/auth';
import progressRoutes from './routes/progress';
import interactiveRoutes from './routes/interactive';

dotenv.config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Periodic Language API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/elements', elementRoutes);
app.use('/api/compounds', compoundRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/interactive', interactiveRoutes);

export default app;
