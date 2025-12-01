# 📊 KPI Dashboard - Tablero de Control de Producción de Software

Dashboard interactivo para monitorear 2 objetivos clave según DORA Metrics:

1. **Lead Time** ⏱️ - Tiempo desde inicio hasta producción
2. **Defectos Escapados** 🐛 - % de bugs en producción por lote

---

## 🚀 Quick Start

### Requisitos
- **Node.js** v16+
- **SQL Server** 2019+ o Azure SQL Database
- **npm** v8+

### 1. Configurar Base de Datos

```bash
# Windows
.\migrate-db.bat (local)

# Linux/Mac
./migrate-db.sh localhost
```

O manualmente:
```sql
-- Abrir SQL Server Management Studio
-- Ejecutar scripts en orden:
1. sql/schema.sql
2. sql/seed.sql
```

### 2. Configurar Backend

```bash
cd backend
npm install

# Crear .env (copiar de .env.example si existe)
# Editar variables:
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=<tu_password>
DB_NAME=kpi_softprod
PORT=3001

npm run dev
```

### 3. Abrir Frontend

```bash
# En otra terminal
cd frontend
# Abrir index.html en navegador
# O usar http://localhost:3001
```

---

## 📋 Estructura del Proyecto

```
kpi-dashboard/
├── backend/
│   ├── src/
│   │   ├── index.js              # Servidor Express
│   │   ├── db.js                 # Conexión SQL Server
│   │   ├── metrics.controller.js # Lógica de KPIs
│   │   └── metrics.routes.js     # Rutas API
│   ├── package.json
│   └── .env                      # Variables de entorno
├── frontend/
│   ├── index.html                # Dashboard principal
│   ├── assets/
│   │   └── app.js                # Lógica de UI
│   └── css/
│       └── style.css             # Estilos
├── sql/
│   ├── schema.sql                # Estructura BD
│   └── seed.sql                  # Datos de ejemplo
├── CAMBIOS.md                    # Resumen de modificaciones
├── migrate-db.bat                # Script migración (Windows)
└── README.md                     # Este archivo
```

---

## 🔌 API Endpoints

### Lead Time
```
GET /api/metrics/lead-time
GET /api/metrics/lead-time/series
GET /api/metrics/lead-time/by-ticket
```

### Deploy Frequency
```
GET /api/metrics/deploy-frequency
```

### Defect Escape (POR LOTE)
```
GET /api/metrics/defect-escape      # Lote actual
GET /api/metrics/defect-escape/series # Histórico
```

---

## 📊 Esquema de Base de Datos

### Tabla: `tickets`
```sql
id INT PK
key_code NVARCHAR(32)           -- Ej: PROJ-101
type NVARCHAR(16)               -- story | bug | task
status NVARCHAR(16)             -- todo | in_progress | done
started_at DATETIME2
completed_at DATETIME2
deployed_at DATETIME2           -- Deploy a producción
in_production BIT               -- ¿Está en prod?
batch_number INT                -- Lote (cada 30 entregas)
found_in_production_at DATETIME2 -- Cuándo se reportó bug
```

### Tabla: `batches`
```sql
batch_number INT PK
item_count INT                  -- Siempre 30
total_delivered INT             -- Items entregados
total_bugs_escaped INT          -- Bugs en producción
closed_at DATETIME2             -- Fecha cierre lote
```

### Tabla: `deployments`
```sql
id INT PK
version NVARCHAR(40)
deployed_at DATETIME2
```

---

## 🎯 KPIs Explicados

### KPI 1: Lead Time (Objetivo: ≤ 7 días)

**Definición:** Tiempo promedio desde que inicia una tarea hasta que se despliega en producción.

**Cálculo:**
```
Lead Time = deployed_at - started_at (en días)
```

**Benchmarks DORA:**
- 🟢 **Élite**: 1-3 días
- 🟡 **Intermedio**: 3-7 días
- 🔴 **Bajo**: > 7 días

**Visualización:**
- Tabla individual por ticket
- Gráfico de barras horizontal con código de color
- Valor promedio destacado

---

### KPI 2: Defectos Escapados (Objetivo: < 15%)

**Definición:** Porcentaje de bugs reportados en producción vs total de ítems entregados en un lote de 30.

**Cálculo:**
```
Tasa = (Bugs en producción / 30 ítems) × 100
```

**Criterio: POR LOTE** (no por fecha)
- Cada lote = 30 ítems completados
- Se cierra automáticamente cuando se alcanzan 30

**Benchmarks Industria:**
- 🟢 **Élite**: 0-5%
- 🟡 **Intermedio**: 5-15%
- 🔴 **Crítico**: > 15%

**Visualización:**
- Gauge doughnut del lote actual
- Serie temporal de todos los lotes
- Status badge (Élite/Intermedio/Crítico)

---

## 🛠️ Desarrollo

### Agregar nuevo KPI

1. **Backend** (`metrics.controller.js`):
```javascript
export async function getNewMetric(req, res) {
  const r = await pool.request().query(`...`);
  res.json({ kpi: 'metric_name', value: r.recordset[0].value });
}
```

2. **Routes** (`metrics.routes.js`):
```javascript
r.get('/new-metric', getNewMetric);
```

3. **Frontend** (`app.js`):
```javascript
async function loadNewMetric() {
  const v = await fetchJSON(`${API}/new-metric`);
  // Actualizar DOM
}
```

### Cambiar umbrales

**Backend** - En `metrics.controller.js`:
```javascript
if (rate > 5) status = 'intermediate';  // Cambiar 5 por otro valor
```

**Frontend** - En `app.js`:
```javascript
function getDefectColor(pct, status) {
  // Ajustar rangos aquí
}
```

---

## 🧪 Testing

### Verificar conexión BD
```javascript
// En backend/src/index.js
const r = await pool.request().query('SELECT 1 AS test');
console.log('✅ BD conectada');
```

### Verificar endpoints
```bash
curl http://localhost:3001/api/metrics/lead-time
curl http://localhost:3001/api/metrics/defect-escape
```

### Limpiar datos
```sql
DELETE FROM dbo.tickets;
DELETE FROM dbo.batches;
```

---

## 📝 Variables de Entorno

```env
# backend/.env
DB_HOST=localhost
DB_USER=sa
DB_PASSWORD=TuPasswordAqui123!
DB_NAME=kpi_softprod
DB_PORT=1433
PORT=3001
NODE_ENV=development
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
```bash
# Verificar que SQL Server esté corriendo
# En Windows: Services → SQL Server
# En Linux: sudo systemctl status mssql-server

# Verificar credenciales en .env
```

### Gráficos no se ven
```bash
# Verificar que Chart.js CDN está disponible
# Revisar console del navegador (F12 → Console)
# Limpiar caché: Ctrl+Shift+R
```

### Datos de ejemplo no aparecen
```sql
-- Verificar que existan registros
SELECT COUNT(*) FROM dbo.tickets;
SELECT * FROM dbo.batches;
```

---

## 📚 Referencias

- **DORA Metrics**: https://dora.dev
- **Chart.js**: https://www.chartjs.org
- **SQL Server**: https://learn.microsoft.com/sql

---

## 📄 Licencia

ISC

---

## 👥 Autores

Proyecto académico - Informática Industrial 2025

**Última actualización:** Noviembre 2025
