-- MySQL schema for KPI dashboard (compatible MySQL 8+)
CREATE DATABASE IF NOT EXISTS kpi_softprod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kpi_softprod;

-- Drop tables if exist (order matters due to FK)
DROP TABLE IF EXISTS kpi_measurements;
DROP TABLE IF EXISTS deployments;
DROP TABLE IF EXISTS tickets;

-- tickets table
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_code VARCHAR(32) NOT NULL, -- e.g., PROJ-123
  type ENUM('story','bug','task') NOT NULL,
  status ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  deployed_at DATETIME NULL,
  in_production TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_tickets_dates (started_at, completed_at, deployed_at),
  INDEX idx_tickets_deployed (deployed_at),
  INDEX idx_tickets_type (type),
  INDEX idx_tickets_status (status)
) ENGINE=InnoDB;

-- deployments table
CREATE TABLE deployments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(40) NOT NULL,
  deployed_at DATETIME NOT NULL,
  INDEX idx_deployments_date (deployed_at)
) ENGINE=InnoDB;

-- Optional KPI cache table
CREATE TABLE kpi_measurements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kpi_code VARCHAR(32) NOT NULL,             -- 'lead_time','deploy_freq','defect_escape'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_kpi_period (period_start, period_end),
  INDEX idx_kpi_code (kpi_code)
) ENGINE=InnoDB;

-- (Optional) calendar weeks helper if MySQL < 8 (no recursive CTE)
-- Uncomment to pre-populate weeks if needed.
-- CREATE TABLE calendar_weeks (
--   week_start DATE PRIMARY KEY
-- ) ENGINE=InnoDB;
-- INSERT INTO calendar_weeks(week_start)
-- SELECT DATE('2025-01-06') + INTERVAL (n.num) WEEK
-- FROM (
--   SELECT units.i + tens.i*10 AS num
--   FROM (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) units
--   CROSS JOIN (SELECT 0 i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) tens
-- ) n
-- WHERE DATE('2025-01-06') + INTERVAL (n.num) WEEK < DATE('2026-12-31');
