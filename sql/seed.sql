USE kpi_softprod;
GO

INSERT INTO dbo.deployments(version, deployed_at) VALUES
(N'1.0.0', '2025-08-18T10:00:00'),
(N'1.1.0', '2025-08-25T11:30:00'),
(N'1.2.0', '2025-09-01T12:00:00'),
(N'1.2.1', '2025-09-04T09:15:00'),
(N'1.3.0', '2025-09-08T18:45:00');

INSERT INTO dbo.tickets(key_code,[type],[status],started_at,completed_at,deployed_at,in_production) VALUES
(N'PROJ-101',N'story',N'done','2025-08-10','2025-08-16','2025-08-18',1),
(N'PROJ-102',N'story',N'done','2025-08-17','2025-08-23','2025-08-25',1),
(N'PROJ-103',N'bug',  N'done','2025-08-26','2025-08-30','2025-09-01',1),
(N'PROJ-104',N'story',N'done','2025-08-28','2025-09-03','2025-09-04',1),
(N'PROJ-105',N'bug',  N'done','2025-09-05','2025-09-07','2025-09-08',1),
(N'PROJ-106',N'story',N'done','2025-09-02','2025-09-08','2025-09-08',1);
