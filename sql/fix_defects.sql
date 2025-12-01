-- ============================================================================
-- ACTUALIZAR DEFECTOS ESCAPADOS EN BATCHES 1 Y 2
-- ============================================================================
-- Este script agrega los defectos escapados a los tickets existentes
-- para que se reflejen correctamente en los KPIs

-- BATCH 1: 2 bugs escapados (PROJ-004, PROJ-010) = 6.67%
UPDATE dbo.tickets SET found_in_production_at = '2025-08-20 14:30' WHERE key_code = 'PROJ-004';
UPDATE dbo.tickets SET found_in_production_at = '2025-08-26 10:00' WHERE key_code = 'PROJ-010';

-- BATCH 2: 3 bugs escapados (PROJ-034, PROJ-045, PROJ-055) = 10%
UPDATE dbo.tickets SET found_in_production_at = '2025-09-05 09:15' WHERE key_code = 'PROJ-034';
UPDATE dbo.tickets SET found_in_production_at = '2025-09-11 16:45' WHERE key_code = 'PROJ-045';
UPDATE dbo.tickets SET found_in_production_at = '2025-09-20 11:30' WHERE key_code = 'PROJ-055';

-- Actualizar los registros de batches con el conteo correcto
UPDATE dbo.batches 
SET total_bugs_escaped = (SELECT COUNT(*) FROM dbo.tickets WHERE batch_number = 1 AND found_in_production_at IS NOT NULL)
WHERE batch_number = 1;

UPDATE dbo.batches 
SET total_bugs_escaped = (SELECT COUNT(*) FROM dbo.tickets WHERE batch_number = 2 AND found_in_production_at IS NOT NULL)
WHERE batch_number = 2;

UPDATE dbo.batches 
SET total_bugs_escaped = (SELECT COUNT(*) FROM dbo.tickets WHERE batch_number = 3 AND found_in_production_at IS NOT NULL)
WHERE batch_number = 3;

-- Verificación: Mostrar los defectos por batch
SELECT 
  batch_number,
  total_delivered,
  total_bugs_escaped,
  CAST((total_bugs_escaped * 100.0 / total_delivered) AS DECIMAL(5,2)) AS escape_rate_pct,
  CASE 
    WHEN (total_bugs_escaped * 100.0 / total_delivered) < 5 THEN '✅ ÉLITE'
    WHEN (total_bugs_escaped * 100.0 / total_delivered) < 15 THEN '🟡 INTERMEDIO'
    ELSE '🔴 CRÍTICO'
  END AS status
FROM dbo.batches
ORDER BY batch_number;
