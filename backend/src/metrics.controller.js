import { poolConnect, pool, sql } from './db.js';

// Obtener lista de batches
export async function getBatches(req, res) {
  await poolConnect;
  const r = await pool.request().query(`
    SELECT DISTINCT batch_number
    FROM dbo.batches
    WHERE batch_number IS NOT NULL
    ORDER BY batch_number
  `);
  
  const batches = r.recordset.map(row => ({
    id: row.batch_number,
    label: `Batch ${row.batch_number}`
  }));
  
  res.json(batches);
}

function getRange(q) {
  const from = q.from ? new Date(q.from) : new Date(Date.now() - 30*24*3600*1000);
  const to   = q.to   ? new Date(q.to)   : new Date();
  return {from, to};
}

// KPI 1: Lead Time promedio (días) = DATEDIFF(HOUR)/24
export async function getLeadTime(req, res) {
  await poolConnect;
  const batch = req.query.batch ? parseInt(req.query.batch) : null;
  
  let whereClause = 'WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL';
  if (batch) {
    whereClause += ` AND batch_number = @batch`;
  }
  
  const request = pool.request();
  if (batch) {
    request.input('batch', sql.Int, batch);
  }
  
  const r = await request.query(`
    SELECT CAST(AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 AS FLOAT) AS lead_time_days
    FROM dbo.tickets
    ${whereClause}
  `);
  const v = r.recordset[0]?.lead_time_days ?? 0;
  res.json({ kpi: 'lead_time', unit: 'days', value: Number(v) });
}

// Serie: Lead Time por ticket (ordenado por fecha de deploy)
export async function getLeadTimeByTicket(req, res) {
  await poolConnect;
  const batch = req.query.batch ? parseInt(req.query.batch) : null;
  
  let whereClause = 'WHERE started_at IS NOT NULL AND deployed_at IS NOT NULL';
  if (batch) {
    whereClause += ` AND batch_number = @batch`;
  }
  
  const request = pool.request();
  if (batch) {
    request.input('batch', sql.Int, batch);
  }
  
  const r = await request.query(`
    SELECT 
      key_code,
      CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT)/24.0 AS lead_time_days,
      deployed_at
    FROM dbo.tickets
    ${whereClause}
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
  const batch = req.query.batch ? parseInt(req.query.batch) : null;

  let whereClause = 'WHERE deployed_at IS NOT NULL';
  if (batch) {
    whereClause = `
      WHERE deployed_at IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM dbo.tickets t
          WHERE t.batch_number = @batch
            AND t.deployed_at = d.deployed_at
        )
    `;
  }

  const request = pool.request();
  if (batch) {
    request.input('batch', sql.Int, batch);
  }

  const r = await request.query(`
    SET DATEFIRST 1; -- Lunes

    DECLARE @fromDate date = CAST(GETDATE() - 90 AS date);
    DECLARE @toDate   date = CAST(GETDATE() AS date);

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
        DATEADD(day, 1 - DATEPART(weekday, CAST(d.deployed_at AS date)), CAST(d.deployed_at AS date)) AS week_start,
        COUNT(*) AS cnt
      FROM dbo.deployments d
      ${whereClause}
      GROUP BY DATEADD(day, 1 - DATEPART(weekday, CAST(d.deployed_at AS date)), CAST(d.deployed_at AS date))
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


// KPI 3: Tasa de defectos escapados POR LOTE = bugs en prod / 30 ítems (%)
// Se calcula por cada lote de 30 ítems entregados
export async function getDefectEscape(req, res) {
  await poolConnect;
  const batch = req.query.batch ? parseInt(req.query.batch) : null;
  
  let whereClause = 'WHERE closed_at IS NOT NULL';
  if (batch) {
    whereClause += ` AND batch_number = @batch`;
  }
  
  const request = pool.request();
  if (batch) {
    request.input('batch', sql.Int, batch);
  }
  
  const r = await request.query(`
    SELECT TOP 1
      batch_number,
      total_delivered,
      total_bugs_escaped,
      CASE 
        WHEN total_delivered > 0 THEN CAST((total_bugs_escaped * 100.0 / total_delivered) AS FLOAT)
        ELSE 0
      END AS escape_rate
    FROM dbo.batches
    ${whereClause}
    ORDER BY batch_number DESC
  `);
  
  if (r.recordset.length === 0) {
    return res.json({ 
      kpi: 'defect_escape', 
      unit: '%', 
      value: 0,
      batch_number: null,
      status: 'healthy'
    });
  }
  
  const latest = r.recordset[0];
  const rate = Number(latest.escape_rate || 0);
  
  // Clasificación según benchmark
  let status = 'elite';
  if (rate > 5) status = 'intermediate';
  if (rate > 15) status = 'critical';
  
  res.json({ 
    kpi: 'defect_escape', 
    unit: '%', 
    value: Number(rate.toFixed(2)),
    batch_number: latest.batch_number,
    status: status
  });
}

// Serie: Tasa de defectos por lote (histórico)
export async function getDefectEscapeSeries(req, res) {
  await poolConnect;
  const batch = req.query.batch ? parseInt(req.query.batch) : null;
  
  let whereClause = 'WHERE closed_at IS NOT NULL';
  if (batch) {
    whereClause += ` AND batch_number = @batch`;
  }
  
  const request = pool.request();
  if (batch) {
    request.input('batch', sql.Int, batch);
  }
  
  const r = await request.query(`
    SELECT
      batch_number,
      total_delivered,
      total_bugs_escaped,
      CASE 
        WHEN total_delivered > 0 THEN CAST((total_bugs_escaped * 100.0 / total_delivered) AS FLOAT)
        ELSE 0
      END AS escape_rate,
      closed_at
    FROM dbo.batches
    ${whereClause}
    ORDER BY batch_number
  `);
  
  res.json(r.recordset);
}

// Obtener rango de fechas del batch
export async function getBatchInfo(req, res) {
  await poolConnect;
  const batch = req.query.batch ? parseInt(req.query.batch) : null;
  
  if (!batch) {
    return res.json({ batch_number: null, first_ticket_date: null, last_ticket_date: null });
  }
  
  const r = await pool.request()
    .input('batch', sql.Int, batch)
    .query(`
      SELECT
        batch_number,
        MIN(started_at) AS first_ticket_date,
        MAX(deployed_at) AS last_ticket_date
      FROM dbo.tickets
      WHERE batch_number = @batch
      GROUP BY batch_number
    `);
  
  if (r.recordset.length === 0) {
    return res.json({ batch_number: batch, first_ticket_date: null, last_ticket_date: null });
  }
  
  res.json(r.recordset[0]);
}
