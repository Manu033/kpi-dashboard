import express from 'express';
import cors from 'cors';
import metricsRoutes from './metrics.routes.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ok:true}));
app.use('/api/metrics', metricsRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
