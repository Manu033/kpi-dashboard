import { Router } from 'express';
import { getLeadTime, getLeadTimeSeries, getDeployFrequency, getDefectEscape, getLeadTimeByTicket} from './metrics.controller.js';

const r = Router();

// Ej: /api/metrics/lead-time?from=2025-08-15&to=2025-09-09
r.get('/lead-time', getLeadTime);
r.get('/lead-time/series', getLeadTimeSeries);
r.get('/deploy-frequency', getDeployFrequency);
r.get('/defect-escape', getDefectEscape);
r.get('/lead-time/by-ticket', getLeadTimeByTicket);

export default r;
