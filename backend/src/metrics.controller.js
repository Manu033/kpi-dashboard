import { pool } from './db.js';

function getRange(q) {
  const from = q.from ? new Date(q.from) : new Date(Date.now() - 30*24*3600*1000);
  const to   = q.to   ? new Date(q.to)   : new Date();
  return { from, to };
}

// KPI: Lead Time promedio (días)
export async function getLeadTime(req, res) {
  const { from, to } = getRange(req.query);
  const sql = `SELECT AVG(TIMESTAMPDIFF(HOUR, started_at, deployed_at))/24.0 AS lead_time_days
               FROM tickets
               WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL
                 AND started_at >= ? AND deployed_at <= ?`;
  try {
    const [rows] = await pool.execute(sql, [from, to]);
    const v = rows[0]?.lead_time_days ?? 0;
    res.json({ kpi: 'lead_time', unit: 'days', value: Number(v) });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'lead_time_query_failed' });
  }
}

// Lead Time por ticket
export async function getLeadTimeByTicket(req, res) {
  const { from, to } = getRange(req.query);
  const sql = `SELECT key_code,
                      TIMESTAMPDIFF(HOUR, started_at, deployed_at)/24.0 AS lead_time_days,
                      deployed_at
               FROM tickets
               WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL
                 AND deployed_at BETWEEN ? AND ?
               ORDER BY deployed_at`;
  try {
    const [rows] = await pool.execute(sql, [from, to]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'lead_time_by_ticket_query_failed' }); }
}

// Serie diaria de Lead Time
export async function getLeadTimeSeries(req, res) {
  const { from, to } = getRange(req.query);
  const sql = `SELECT DATE(deployed_at) AS day,
                      AVG(TIMESTAMPDIFF(HOUR, started_at, deployed_at))/24.0 AS lead_time_days
               FROM tickets
               WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL
                 AND deployed_at BETWEEN ? AND ?
               GROUP BY DATE(deployed_at)
               ORDER BY day`;
  try {
    const [rows] = await pool.execute(sql, [from, to]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'lead_time_series_query_failed' }); }
}

// Frecuencia de despliegue semanal (requiere MySQL 8 para WITH RECURSIVE)
export async function getDeployFrequency(req, res) {
  const { from, to } = getRange(req.query);
  const sql = `WITH RECURSIVE weeks AS (
                 SELECT DATE_SUB(DATE(?), INTERVAL WEEKDAY(DATE(?)) DAY) AS week_start
                 UNION ALL
                 SELECT DATE_ADD(week_start, INTERVAL 1 WEEK) FROM weeks WHERE week_start < DATE(?)
               ), deploys AS (
                 SELECT DATE_SUB(DATE(deployed_at), INTERVAL WEEKDAY(DATE(deployed_at)) DAY) AS week_start,
                        COUNT(*) AS cnt
                 FROM deployments
                 WHERE deployed_at BETWEEN ? AND ?
                 GROUP BY DATE_SUB(DATE(deployed_at), INTERVAL WEEKDAY(DATE(deployed_at)) DAY)
               )
               SELECT CONCAT(YEAR(w.week_start), '-', LPAD(WEEK(w.week_start, 1), 2, '0')) AS yw,
                      COALESCE(d.cnt, 0) AS deployments
               FROM weeks w
               LEFT JOIN deploys d USING (week_start)
               ORDER BY w.week_start;`;
  try {
    const [rows] = await pool.execute(sql, [from, from, to, from, to]);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'deploy_frequency_query_failed' }); }
}

// Defectos escapados (%)
export async function getDefectEscape(req, res) {
  const { from, to } = getRange(req.query);
  const sql = `SELECT
                 SUM(CASE WHEN type='bug' AND in_production=1 AND deployed_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS prod_bugs,
                 SUM(CASE WHEN status='done' AND deployed_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS total_delivered
               FROM tickets`;
  try {
    const [rows] = await pool.execute(sql, [from, to, from, to]);
    const prod_bugs = Number(rows[0]?.prod_bugs || 0);
    const total_delivered = Number(rows[0]?.total_delivered || 0);
    const pct = total_delivered > 0 ? (prod_bugs / total_delivered) * 100 : 0;
    res.json({ kpi: 'defect_escape', unit: '%', value: Number(pct.toFixed(2)) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'defect_escape_query_failed' }); }
}
