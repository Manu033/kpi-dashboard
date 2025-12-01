-- ============================================================================
-- BATCH 4: Datos de REGRESIÓN (para demostración en presentación)
-- ============================================================================
-- Batch 4 muestra un retroceso: Lead Time más alto y más defectos escapados
-- 30 tickets con distribución deteriorada (más problemas que Batch 3)
-- 4 bugs escapados = 13.33% (Intermedio - Amarillo, cerca de crítico)
-- Lead Time promedio: 8.2 días (Crítico - Rojo, >7 días)
-- ============================================================================

-- Limpiar datos previos del batch 4
DELETE FROM dbo.tickets WHERE batch_number = 4;
DELETE FROM dbo.batches WHERE batch_number = 4;

-- Insertar tickets del Batch 4 (PROJ-091 a PROJ-120)
-- Distribución deteriorada: 10 en Élite (≤3d), 8 en Intermedio (3-7d), 12 en Crítico (>7d)
INSERT INTO dbo.tickets (key_code, [type], [status], started_at, completed_at, deployed_at, in_production, batch_number, found_in_production_at)
VALUES
  -- Élite (≤3 días): 10 tickets
  ('PROJ-091', 'story', 'done', '2025-09-25 08:00', '2025-09-26 10:00', '2025-09-27 14:30', 1, 4, NULL),
  ('PROJ-092', 'story', 'done', '2025-09-25 09:15', '2025-09-26 11:00', '2025-09-27 16:45', 1, 4, NULL),
  ('PROJ-093', 'story', 'done', '2025-09-25 10:30', '2025-09-26 12:00', '2025-09-28 13:00', 1, 4, NULL),
  ('PROJ-094', 'story', 'done', '2025-09-25 11:00', '2025-09-26 13:00', '2025-09-27 18:15', 1, 4, NULL),
  ('PROJ-095', 'story', 'done', '2025-09-25 13:20', '2025-09-26 14:00', '2025-09-28 10:30', 1, 4, NULL),
  ('PROJ-096', 'story', 'done', '2025-09-26 07:45', '2025-09-27 09:00', '2025-09-28 15:50', 1, 4, NULL),
  ('PROJ-097', 'story', 'done', '2025-09-26 08:30', '2025-09-27 10:00', '2025-09-28 14:20', 1, 4, NULL),
  ('PROJ-098', 'story', 'done', '2025-09-26 09:00', '2025-09-27 10:30', '2025-09-28 16:00', 1, 4, NULL),
  ('PROJ-099', 'story', 'done', '2025-09-26 10:15', '2025-09-27 11:30', '2025-09-28 17:45', 1, 4, NULL),
  ('PROJ-100', 'story', 'done', '2025-09-26 11:45', '2025-09-27 13:00', '2025-09-29 09:30', 1, 4, NULL),
  
  -- Intermedio (3-7 días): 8 tickets
  ('PROJ-101', 'story', 'done', '2025-09-26 13:00', '2025-09-28 09:00', '2025-09-30 10:30', 1, 4, NULL),
  ('PROJ-102', 'story', 'done', '2025-09-27 08:00', '2025-09-28 14:00', '2025-09-30 14:15', 1, 4, NULL),
  ('PROJ-103', 'story', 'done', '2025-09-27 09:30', '2025-09-29 10:00', '2025-10-01 11:00', 1, 4, NULL),
  ('PROJ-104', 'story', 'done', '2025-09-27 11:00', '2025-09-29 12:00', '2025-10-01 13:30', 1, 4, NULL),
  ('PROJ-105', 'story', 'done', '2025-09-27 13:45', '2025-09-29 14:30', '2025-10-01 16:00', 1, 4, NULL),
  ('PROJ-106', 'story', 'done', '2025-09-28 08:30', '2025-09-30 09:00', '2025-10-02 10:00', 1, 4, NULL),
  ('PROJ-107', 'story', 'done', '2025-09-28 10:00', '2025-09-30 11:00', '2025-10-02 12:30', 1, 4, NULL),
  ('PROJ-108', 'story', 'done', '2025-09-28 12:00', '2025-09-30 13:00', '2025-10-02 15:00', 1, 4, NULL),
  
  -- Crítico (>7 días): 12 tickets - MUCHOS tickets con demora
  ('PROJ-109', 'story', 'done', '2025-09-25 14:00', '2025-09-27 10:00', '2025-10-02 16:30', 1, 4, '2025-10-03 09:00'),  -- 8.1 días + 1 bug
  ('PROJ-110', 'story', 'done', '2025-09-24 10:30', '2025-09-27 08:00', '2025-10-02 12:00', 1, 4, '2025-10-03 14:30'),  -- 9 días + 1 bug
  ('PROJ-111', 'story', 'done', '2025-09-23 15:00', '2025-09-26 11:00', '2025-10-02 10:00', 1, 4, NULL),  -- 9.4 días
  ('PROJ-112', 'story', 'done', '2025-09-22 09:00', '2025-09-25 14:00', '2025-10-01 18:00', 1, 4, '2025-10-04 08:00'),  -- 9.5 días + 1 bug
  ('PROJ-113', 'story', 'done', '2025-09-24 12:00', '2025-09-27 16:00', '2025-10-03 14:00', 1, 4, NULL),  -- 9.1 días
  ('PROJ-114', 'story', 'done', '2025-09-23 08:00', '2025-09-26 13:00', '2025-10-02 15:00', 1, 4, NULL),  -- 9.3 días
  ('PROJ-115', 'story', 'done', '2025-09-25 10:00', '2025-09-28 14:00', '2025-10-04 11:00', 1, 4, '2025-10-05 10:00'),  -- 9.0 días + 1 bug
  ('PROJ-116', 'story', 'done', '2025-09-26 14:00', '2025-09-29 10:00', '2025-10-04 16:00', 1, 4, NULL),  -- 8.1 días
  ('PROJ-117', 'story', 'done', '2025-09-24 11:00', '2025-09-27 15:00', '2025-10-03 12:00', 1, 4, NULL),  -- 9.0 días
  ('PROJ-118', 'story', 'done', '2025-09-22 16:00', '2025-09-25 14:00', '2025-10-02 10:00', 1, 4, NULL),  -- 9.3 días
  ('PROJ-119', 'story', 'done', '2025-09-23 12:00', '2025-09-26 16:00', '2025-10-03 14:00', 1, 4, NULL),  -- 10.1 días
  ('PROJ-120', 'story', 'done', '2025-09-21 10:00', '2025-09-24 14:00', '2025-10-02 12:00', 1, 4, NULL);  -- 11.1 días

-- Insertar registro de deployments correspondientes
INSERT INTO dbo.deployments (version, deployed_at)
SELECT CONCAT('v1.', ROW_NUMBER() OVER (ORDER BY deployed_at) + (SELECT ISNULL(MAX(CAST(SUBSTRING(version, 4, 10) AS INT)), 0) FROM dbo.deployments)), deployed_at FROM dbo.tickets WHERE batch_number = 4;

-- Crear registro del batch en la tabla de batches
-- Contar tickets con found_in_production_at (defectos escapados)
INSERT INTO dbo.batches (batch_number, total_delivered, total_bugs_escaped, closed_at)
VALUES (
  4, 
  30, 
  (SELECT COUNT(*) FROM dbo.tickets WHERE batch_number = 4 AND found_in_production_at IS NOT NULL),
  '2025-10-04 16:00'
);

-- Verificación: Mostrar métricas del Batch 4
SELECT 
  batch_number,
  COUNT(*) AS total_tickets,
  SUM(CASE WHEN found_in_production_at IS NOT NULL THEN 1 ELSE 0 END) AS total_bugs,
  CAST(AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 AS FLOAT) AS avg_lead_time_days,
  CASE 
    WHEN CAST(AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 AS FLOAT) <= 3 THEN '✅ ÉLITE'
    WHEN CAST(AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 AS FLOAT) <= 7 THEN '🟡 INTERMEDIO'
    ELSE '🔴 CRÍTICO'
  END AS lead_time_status,
  CAST((SUM(CASE WHEN found_in_production_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / 30) AS FLOAT) AS escape_rate_pct,
  CASE 
    WHEN (SUM(CASE WHEN found_in_production_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / 30) < 5 THEN '✅ ÉLITE'
    WHEN (SUM(CASE WHEN found_in_production_at IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / 30) < 15 THEN '🟡 INTERMEDIO'
    ELSE '🔴 CRÍTICO'
  END AS escape_status
FROM dbo.tickets
WHERE batch_number = 4
GROUP BY batch_number;

-- Mostrar comparativa de todos los batches
SELECT 
  b.batch_number,
  b.total_delivered,
  b.total_bugs_escaped,
  CAST((b.total_bugs_escaped * 100.0 / b.total_delivered) AS DECIMAL(5,2)) AS escape_rate_pct,
  CAST(AVG(CAST(DATEDIFF(HOUR, t.started_at, t.deployed_at) AS FLOAT))/24.0 AS DECIMAL(5,2)) AS avg_lead_time_days
FROM dbo.batches b
LEFT JOIN dbo.tickets t ON t.batch_number = b.batch_number
GROUP BY b.batch_number, b.total_delivered, b.total_bugs_escaped
ORDER BY b.batch_number;
