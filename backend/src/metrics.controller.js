import { poolConnect, pool, sql } from './db.js';

function getRange(q) {
  const from = q.from ? new Date(q.from) : new Date(Date.now() - 30*24*3600*1000);
  const to   = q.to   ? new Date(q.to)   : new Date();
  return {from, to};
}

// KPI 1: Lead Time promedio (días) = DATEDIFF(HOUR)/24
export async function getLeadTime(req, res) {
  await poolConnect;
  const {from, to} = getRange(req.query);
  const r = await pool.request()
    .input('from', sql.DateTime2, from)
    .input('to',   sql.DateTime2, to)
    .query(`
      SELECT CAST(AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 AS FLOAT) AS lead_time_days
      FROM dbo.tickets
      WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL
        AND started_at >= @from AND deployed_at <= @to
    `);
  const v = r.recordset[0]?.lead_time_days ?? 0;
  res.json({ kpi: 'lead_time', unit: 'days', value: Number(v) });
}

// Serie: Lead Time por ticket (ordenado por fecha de deploy)
export async function getLeadTimeByTicket(req, res) {
  await poolConnect;
  const { from, to } = getRange(req.query);
  const r = await pool.request()
    .input('from', sql.DateTime2, from)
    .input('to',   sql.DateTime2, to)
    .query(`
      SELECT 
        key_code,
        CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT)/24.0 AS lead_time_days,
        deployed_at
      FROM dbo.tickets
      WHERE started_at IS NOT NULL 
        AND deployed_at IS NOT NULL
        AND deployed_at BETWEEN @from AND @to
      ORDER BY deployed_at
    `);
  res.json(r.recordset);
}

// Serie temporal por día (fecha del deploy)
export async function getLeadTimeSeries(req, res) {
  await poolConnect;
  const {from, to} = getRange(req.query);
  const r = await pool.request()
    .input('from', sql.DateTime2, from)
    .input('to',   sql.DateTime2, to)
    .query(`
      SELECT CAST(deployed_at AS date) AS [day],
             AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 AS lead_time_days
      FROM dbo.tickets
      WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL
        AND deployed_at BETWEEN @from AND @to
      GROUP BY CAST(deployed_at AS date)
      ORDER BY [day]
    `);
  res.json(r.recordset);
}

// KPI 2: Frecuencia de despliegue por semana (año-semana estándar SQL Server)
export async function getDeployFrequency(req, res) {
  await poolConnect;
  const {from, to} = getRange(req.query);

  const r = await pool.request()
    .input('from', sql.DateTime2, from)
    .input('to',   sql.DateTime2, to)
    .query(`
      SET DATEFIRST 1; -- Lunes

      DECLARE @fromDate date = CAST(@from AS date);
      DECLARE @toDate   date = CAST(@to   AS date);

      -- Normalizamos a lunes de la semana de @from
      WITH Weeks AS (
        SELECT DATEADD(day, 1 - DATEPART(weekday, @fromDate), @fromDate) AS week_start
        UNION ALL
        SELECT DATEADD(week, 1, week_start)
        FROM Weeks
        WHERE week_start < @toDate
      ),
      Deploys AS (
        SELECT 
          DATEADD(day, 1 - DATEPART(weekday, CAST(deployed_at AS date)), CAST(deployed_at AS date)) AS week_start,
          COUNT(*) AS cnt
        FROM dbo.deployments
        WHERE deployed_at BETWEEN @from AND @to
        GROUP BY DATEADD(day, 1 - DATEPART(weekday, CAST(deployed_at AS date)), CAST(deployed_at AS date))
      )
      SELECT
        CONCAT(YEAR(w.week_start), '-', RIGHT('00' + CONVERT(varchar(2), DATEPART(week, w.week_start)), 2)) AS yw,
        ISNULL(d.cnt, 0) AS deployments
      FROM Weeks w
      LEFT JOIN Deploys d ON d.week_start = w.week_start
      ORDER BY w.week_start
      OPTION (MAXRECURSION 1000);
    `);

  res.json(r.recordset);
}


// KPI 3: Tasa de defectos escapados = bugs en prod / entregas totales (%)
export async function getDefectEscape(req, res) {
  await poolConnect;
  const {from, to} = getRange(req.query);
  const r = await pool.request()
    .input('from', sql.DateTime2, from)
    .input('to',   sql.DateTime2, to)
    .query(`
      SELECT
        SUM(CASE WHEN [type]='bug' AND in_production=1 AND deployed_at BETWEEN @from AND @to THEN 1 ELSE 0 END) AS prod_bugs,
        SUM(CASE WHEN [status]='done' AND deployed_at BETWEEN @from AND @to THEN 1 ELSE 0 END) AS total_delivered
      FROM dbo.tickets
    `);
  const prod_bugs = Number(r.recordset[0]?.prod_bugs || 0);
  const total_delivered = Number(r.recordset[0]?.total_delivered || 0);
  const pct = total_delivered > 0 ? (prod_bugs / total_delivered) * 100 : 0;
  res.json({ kpi: 'defect_escape', unit: '%', value: Number(pct.toFixed(2)) });
}
