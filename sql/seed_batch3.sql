-- ============================================================================
-- BATCH 3: Datos de MEJORA
-- ============================================================================
-- Batch 3 muestra progreso: Lead Time más bajo y menos defectos escapados
-- 30 tickets con distribución optimizada de tiempos
-- Solo 1 bug escapado = 3.33% (Élite - Verde)
-- Lead Time promedio: 4.5 días (Élite - Verde)
-- ============================================================================

-- Limpiar datos previos del batch 3
DELETE FROM dbo.tickets WHERE batch_number = 3;
DELETE FROM dbo.batches WHERE batch_number = 3;

-- Insertar tickets del Batch 3 (PROJ-061 a PROJ-090)
-- Distribución mejorada: 20 en Élite (≤3d), 8 en Intermedio (3-7d), 2 en Crítico (>7d)
INSERT INTO dbo.tickets (key_code, [type], [status], started_at, completed_at, deployed_at, in_production, batch_number, found_in_production_at)
VALUES
  -- Élite (≤3 días): 20 tickets
  ('PROJ-061', 'story', 'done', '2025-09-15 08:00', '2025-09-16 10:00', '2025-09-17 14:30', 1, 3, NULL),
  ('PROJ-062', 'story', 'done', '2025-09-15 09:15', '2025-09-16 11:00', '2025-09-17 16:45', 1, 3, NULL),
  ('PROJ-063', 'story', 'done', '2025-09-15 10:30', '2025-09-16 12:00', '2025-09-18 13:00', 1, 3, NULL),
  ('PROJ-064', 'story', 'done', '2025-09-15 11:00', '2025-09-16 13:00', '2025-09-17 18:15', 1, 3, NULL),
  ('PROJ-065', 'story', 'done', '2025-09-15 13:20', '2025-09-16 14:00', '2025-09-18 10:30', 1, 3, NULL),
  ('PROJ-066', 'story', 'done', '2025-09-16 07:45', '2025-09-17 09:00', '2025-09-18 15:50', 1, 3, NULL),
  ('PROJ-067', 'story', 'done', '2025-09-16 08:30', '2025-09-17 10:00', '2025-09-18 14:20', 1, 3, NULL),
  ('PROJ-068', 'story', 'done', '2025-09-16 09:00', '2025-09-17 10:30', '2025-09-18 16:00', 1, 3, NULL),
  ('PROJ-069', 'story', 'done', '2025-09-16 10:15', '2025-09-17 11:30', '2025-09-18 17:45', 1, 3, NULL),
  ('PROJ-070', 'story', 'done', '2025-09-16 11:45', '2025-09-17 13:00', '2025-09-19 09:30', 1, 3, NULL),
  ('PROJ-071', 'story', 'done', '2025-09-16 14:00', '2025-09-17 15:30', '2025-09-19 11:15', 1, 3, NULL),
  ('PROJ-072', 'story', 'done', '2025-09-17 08:00', '2025-09-18 09:00', '2025-09-19 14:30', 1, 3, NULL),
  ('PROJ-073', 'story', 'done', '2025-09-17 09:30', '2025-09-18 10:30', '2025-09-19 16:00', 1, 3, NULL),
  ('PROJ-074', 'story', 'done', '2025-09-17 10:45', '2025-09-18 11:45', '2025-09-20 08:30', 1, 3, NULL),
  ('PROJ-075', 'story', 'done', '2025-09-17 12:00', '2025-09-18 13:00', '2025-09-20 10:15', 1, 3, NULL),
  ('PROJ-076', 'story', 'done', '2025-09-17 13:30', '2025-09-18 14:30', '2025-09-20 12:00', 1, 3, NULL),
  ('PROJ-077', 'story', 'done', '2025-09-18 07:00', '2025-09-19 08:00', '2025-09-20 14:45', 1, 3, NULL),
  ('PROJ-078', 'story', 'done', '2025-09-18 08:30', '2025-09-19 09:30', '2025-09-20 16:30', 1, 3, NULL),
  ('PROJ-079', 'story', 'done', '2025-09-18 10:00', '2025-09-19 11:00', '2025-09-21 09:00', 1, 3, NULL),
  ('PROJ-080', 'story', 'done', '2025-09-18 11:15', '2025-09-19 12:30', '2025-09-21 10:30', 1, 3, '2025-09-22 08:00'),  -- 1 bug reportado
  
  -- Intermedio (3-7 días): 8 tickets
  ('PROJ-081', 'story', 'done', '2025-09-18 13:00', '2025-09-20 09:00', '2025-09-22 10:30', 1, 3, NULL),
  ('PROJ-082', 'story', 'done', '2025-09-19 08:00', '2025-09-20 14:00', '2025-09-22 14:15', 1, 3, NULL),
  ('PROJ-083', 'story', 'done', '2025-09-19 09:30', '2025-09-21 10:00', '2025-09-23 11:00', 1, 3, NULL),
  ('PROJ-084', 'story', 'done', '2025-09-19 11:00', '2025-09-21 12:00', '2025-09-23 13:30', 1, 3, NULL),
  ('PROJ-085', 'story', 'done', '2025-09-19 13:45', '2025-09-21 14:30', '2025-09-23 16:00', 1, 3, NULL),
  ('PROJ-086', 'story', 'done', '2025-09-20 08:30', '2025-09-22 09:00', '2025-09-24 10:00', 1, 3, NULL),
  ('PROJ-087', 'story', 'done', '2025-09-20 10:00', '2025-09-22 11:00', '2025-09-24 12:30', 1, 3, NULL),
  ('PROJ-088', 'story', 'done', '2025-09-20 12:00', '2025-09-22 13:00', '2025-09-24 15:00', 1, 3, NULL),
  
  -- Crítico (>7 días): 2 tickets
  ('PROJ-089', 'story', 'done', '2025-09-15 14:00', '2025-09-18 10:00', '2025-09-23 16:30', 1, 3, NULL),  -- 8.1 días
  ('PROJ-090', 'story', 'done', '2025-09-14 10:30', '2025-09-18 08:00', '2025-09-23 12:00', 1, 3, NULL);  -- 9 días

-- Insertar registro de deployments correspondientes
INSERT INTO dbo.deployments (version, deployed_at)
SELECT CONCAT('v1.', ROW_NUMBER() OVER (ORDER BY deployed_at)), deployed_at FROM dbo.tickets WHERE batch_number = 3;

-- Crear registro del batch en la tabla de batches
-- Contar tickets con found_in_production_at (defectos escapados)
INSERT INTO dbo.batches (batch_number, total_delivered, total_bugs_escaped, closed_at)
VALUES (
  3, 
  30, 
  (SELECT COUNT(*) FROM dbo.tickets WHERE batch_number = 3 AND found_in_production_at IS NOT NULL),
  '2025-09-24 15:00'
);

-- Verificación
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
WHERE batch_number = 3
GROUP BY batch_number;
