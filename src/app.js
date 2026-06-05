import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

app.use('/api/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
