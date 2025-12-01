import { Router } from 'express';
import { getBatches, getLeadTime, getLeadTimeSeries, getDeployFrequency, getDefectEscape, getLeadTimeByTicket, getDefectEscapeSeries, getBatchInfo } from './metrics.controller.js';

const r = Router();

// Ej: /api/metrics/lead-time?from=2025-08-15&to=2025-09-09
r.get('/batches', getBatches);
r.get('/batch-info', getBatchInfo);
r.get('/lead-time', getLeadTime);
r.get('/lead-time/series', getLeadTimeSeries);
r.get('/lead-time/by-ticket', getLeadTimeByTicket);
r.get('/deploy-frequency', getDeployFrequency);
r.get('/defect-escape', getDefectEscape);
r.get('/defect-escape/series', getDefectEscapeSeries);

export default r;
