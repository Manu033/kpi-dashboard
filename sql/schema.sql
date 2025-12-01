-- Crear BD
IF DB_ID('kpi_softprod') IS NULL
  CREATE DATABASE kpi_softprod;
GO
USE kpi_softprod;
GO

-- Tabla tickets
IF OBJECT_ID('dbo.tickets','U') IS NOT NULL DROP TABLE dbo.tickets;
CREATE TABLE dbo.tickets (
  id INT IDENTITY(1,1) PRIMARY KEY,
  key_code NVARCHAR(32) NOT NULL,               -- ej: PROJ-123
  [type]  NVARCHAR(16) NOT NULL,                -- story | bug | task
  [status] NVARCHAR(16) NOT NULL DEFAULT 'todo',-- todo | in_progress | done
  started_at  DATETIME2 NULL,
  completed_at DATETIME2 NULL,
  deployed_at  DATETIME2 NULL,                  -- primer deploy que incluye el cambio
  in_production BIT NOT NULL DEFAULT 0,
  batch_number INT NULL,                        -- número de lote (cada 30 ítems entregados)
  found_in_production_at DATETIME2 NULL,        -- fecha en que se reportó el defecto
  CONSTRAINT CK_tickets_type CHECK ([type] IN (N'story',N'bug',N'task')),
  CONSTRAINT CK_tickets_status CHECK ([status] IN (N'todo',N'in_progress',N'done'))
);
CREATE INDEX IX_tickets_dates ON dbo.tickets(started_at, completed_at, deployed_at);
CREATE INDEX IX_tickets_batch ON dbo.tickets(batch_number, deployed_at);

-- Tabla deployments
IF OBJECT_ID('dbo.deployments','U') IS NOT NULL DROP TABLE dbo.deployments;
CREATE TABLE dbo.deployments (
  id INT IDENTITY(1,1) PRIMARY KEY,
  version NVARCHAR(40) NOT NULL,
  deployed_at DATETIME2 NOT NULL
);
CREATE INDEX IX_deployments_date ON dbo.deployments(deployed_at);

-- Tabla de lotes (batches) - cada 30 ítems entregados
IF OBJECT_ID('dbo.batches','U') IS NOT NULL DROP TABLE dbo.batches;
CREATE TABLE dbo.batches (
  batch_number INT PRIMARY KEY,
  item_count INT NOT NULL DEFAULT 0,            -- siempre 30
  closed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  total_delivered INT NOT NULL,                 -- cantidad total entregada
  total_bugs_escaped INT NOT NULL DEFAULT 0     -- bugs encontrados en producción
);

-- (Opcional) cache de KPI
IF OBJECT_ID('dbo.kpi_measurements','U') IS NOT NULL DROP TABLE dbo.kpi_measurements;
CREATE TABLE dbo.kpi_measurements (
  id INT IDENTITY(1,1) PRIMARY KEY,
  kpi_code NVARCHAR(32) NOT NULL,               -- 'lead_time','deploy_freq','defect_escape'
  period_start DATE NOT NULL,
  period_end   DATE NOT NULL,
  value DECIMAL(10,4) NOT NULL,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
