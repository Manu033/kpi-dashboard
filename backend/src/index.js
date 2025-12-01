import express from 'express';
import cors from 'cors';
import metricsRoutes from './metrics.routes.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Optional: serve frontend static files when deploying both on same Node app
const __dirname = path.dirname(fileURLToPath(import.meta.url));
if (process.env.SERVE_FRONTEND === 'true') {
  app.use(express.static(path.join(__dirname, '../frontend')));
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/metrics', metricsRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
