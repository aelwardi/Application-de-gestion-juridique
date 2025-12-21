import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import avocatRoutes from './routes/Avocat.routes';
import userRoutes from './routes/user.routes';
import clientRoutes from './routes/Client.routes';
import authRoutes from './routes/Auth.routes';
import 'dotenv/config';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/avocats', avocatRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`Users route: http://localhost:${PORT}/api/users`);
  console.log(`Avocats route: http://localhost:${PORT}/api/avocats`);
  console.log(`Clients route: http://localhost:${PORT}/api/clients`);
});