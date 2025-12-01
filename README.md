# 📊 KPI Dashboard - Tablero de Control de Producción de Software

> Esta versión incluye adaptación a **MySQL** para despliegue en hosting cPanel / phpMyAdmin. Consulta sección "MySQL & cPanel" al final.

Dashboard interactivo para monitorear 2 objetivos clave según DORA Metrics:

1. **Lead Time** ⏱️ - Tiempo desde inicio hasta producción
2. **Defectos Escapados** 🐛 - % de bugs en producción por lote

---

## 🚀 Quick Start

> Ahora soporta dos modos: **SQL Server (original)** y **MySQL (hosting)**. Para hosting común, usa MySQL.

### Requisitos
- **Node.js** v16+
- **SQL Server** 2019+ o Azure SQL Database
- **npm** v8+

### 1. Configurar Base de Datos

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
```

#### 2.1 Crear archivo `.env`

El backend necesita credenciales de SQL Server. Se incluye un `.env` básico. **Edítalo con tus valores:**

```env
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=YourPassword123!
SQLSERVER_DB=kpi_softprod
PORT=3001
```

**Valores a cambiar:**
- `SQLSERVER_HOST`: Tu servidor SQL Server (localhost, IP, o nombre)
- `SQLSERVER_USER`: Usuario SQL Server (por defecto: `sa`)
- `SQLSERVER_PASSWORD`: Contraseña del usuario
- `SQLSERVER_DB`: Nombre de BD (debe ser `kpi_softprod`)

👉 Ver `CONFIGURAR_ENV.md` para más detalles y solucionar errores de conexión.

#### 2.2 Iniciar Backend

```bash
npm run dev
```

**Salida esperada:**
```
API listening on http://localhost:3001
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

## 🐬 MySQL & cPanel Deployment

### 1. Crear Base de Datos en cPanel
1. En cPanel: MySQL Databases → crear base `kpi_softprod`.
2. Crear usuario y asignarlo con todos los privilegios.
3. En phpMyAdmin seleccionar la base y usar "Import" para subir `sql/mysql_schema.sql` y luego `sql/mysql_seed.sql`.

### 2. Configurar Backend (si tu hosting soporta Node.js)
1. Comprimir carpeta `backend/` en zip y subir vía File Manager.
2. En cPanel: Setup Node.js App (si disponible):
   - Application root: `/backend`
   - Application startup file: `src/index.js`
   - Node version: la más cercana a 18/20
3. Variables de entorno:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=TU_USUARIO
MYSQL_PASSWORD=TU_PASSWORD
MYSQL_DB=kpi_softprod
PORT=3001
SERVE_FRONTEND=true
```
4. Ejecutar `npm install` desde terminal de cPanel o interfaz.
5. Reiniciar la app Node.

Si tu hosting NO soporta Node.js:
- Alternativa A: Deploy sólo frontend en `public_html/` y hostear backend en un servicio externo (Render, Railway, Fly.io, etc.). Ajustar `API` en `frontend/assets/app.js` a la URL pública del backend.
- Alternativa B (más trabajo): Reescribir endpoints en PHP usando PDO MySQL.

### 3. Servir el Frontend
Si usas la opción `SERVE_FRONTEND=true`, Express servirá archivos de `frontend/`. URL final de API: `https://tu-dominio.com/api/metrics/lead-time`.

Si separas frontend:
1. Subir contenido de `frontend/` a `public_html/kpi/`.
2. Editar `frontend/assets/app.js`:
```javascript
const API = 'https://tu-dominio.com/api/metrics';
```

### 4. Verificar
```bash
curl https://tu-dominio.com/api/health
curl https://tu-dominio.com/api/metrics/lead-time
```

### 5. Seguridad Básica
- Agregar encabezados: usar paquete `helmet` en backend.
- Limitar CORS: `app.use(cors({ origin: 'https://tu-dominio.com' }))`.
- Asegurar `.env` fuera de `public_html`.

### 6. Mantenimiento
- Backups BD: desde phpMyAdmin (Export) semanal.
- Logs: agregar middleware para registrar errores.

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
