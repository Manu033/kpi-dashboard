# 🚀 GUÍA RÁPIDA DE EJECUCIÓN

## Estado del Proyecto: ✅ 100% COMPLETADO

Todos los archivos están listos. Solo necesitas ejecutar los comandos a continuación.

---

## PASO 1: Preparar Base de Datos (SQL Server)

### Opción A: Script Automático Windows
```powershell
cd "c:\Users\Usuario\Desktop\2025\Segundo Cuatrimestre\Informatica Industrial\final\kpi-dashboard"
.\migrate-db.bat (local)
```

**Qué hace**: Conecta a SQL Server local, ejecuta schema.sql y seed.sql

### Opción B: Manual en SQL Server Management Studio
1. Abrir SQL Server Management Studio
2. Conectar a tu instancia SQL Server
3. Abrir archivo: `sql/schema.sql` → Ejecutar (F5)
4. Abrir archivo: `sql/seed.sql` → Ejecutar (F5)

**Resultado esperado**: BD `kpi_softprod` creada con 60 tickets en 2 batches

---

## PASO 2: Iniciar Backend Node.js

### 2.1 Configura el archivo `.env`

El archivo `backend/.env` ya existe con valores por defecto. **Edítalo con tus credenciales SQL Server:**

```env
SQLSERVER_HOST=localhost
SQLSERVER_PORT=1433
SQLSERVER_USER=sa
SQLSERVER_PASSWORD=YourPassword123!
SQLSERVER_DB=kpi_softprod
PORT=3001
```

**Cambios necesarios:**
- `SQLSERVER_HOST`: Tu servidor (localhost, IP, o nombre)
- `SQLSERVER_USER`: Usuario SQL Server (generalmente `sa`)
- `SQLSERVER_PASSWORD`: Contraseña real del usuario
- `SQLSERVER_DB`: Debe ser `kpi_softprod` (lo creó schema.sql)

📖 Ver `CONFIGURAR_ENV.md` si necesitas ayuda.

### 2.2 Instala dependencias e inicia

```bash
cd backend
npm install
npm run dev
```

**Salida esperada:**
```
API listening on http://localhost:3001
```

Si ves error sobre "config.server", es que `.env` no está configurado correctamente. Ver `CONFIGURAR_ENV.md`.

---

## PASO 3: Abrir Frontend en Navegador

Opción A - Directamente (funciona sin servidor):
```
Abre: C:\Users\Usuario\Desktop\2025\Segundo Cuatrimestre\Informatica Industrial\final\kpi-dashboard\frontend\index.html
```

Opción B - Con servidor local (mejor):
```bash
cd "c:\Users\Usuario\Desktop\2025\Segundo Cuatrimestre\Informatica Industrial\final\kpi-dashboard\frontend"
npx serve .
# Luego abrir: http://localhost:3000
```

---

## PASO 4: Verificar que Todo Funciona

### En el Frontend deberías ver:

✅ **Lead Time**: Valor alrededor de 15 días  
✅ **Status Badge**: "Bajo rendimiento" (rojo) porque > 7 días  
✅ **Defect Escape**: 10% (última tasa, Batch 2)  
✅ **Status Badge**: "Intermedio" (amarillo)  
✅ **Gráficos**: Múltiples charts renderizando correctamente  

### Colores correctos:
- 🟢 Verde = Élite
- 🟡 Amarillo = Intermedio  
- 🔴 Rojo = Crítico

---

## DATOS DE PRUEBA INCLUIDOS

### Batch 1: 30 tickets
- 28 exitosos
- 2 defectos en producción
- **Defect Rate**: 6.67% (🟡 Intermedio)
- **Período**: Agosto 2025

### Batch 2: 30 tickets  
- 27 exitosos
- 3 defectos en producción
- **Defect Rate**: 10.0% (🟡 Intermedio)
- **Período**: Septiembre 2025

### Lead Time
- Rango: 1 a 29 días
- Promedio: ~15 días (muchos > 7 días para demostrar rangos)
- Muestra todos los estados: Élite, Intermedio, Crítico

---

## 📊 ENDPOINTS DISPONIBLES

Una vez el backend esté corriendo (puerto 3001):

```bash
# Lead Time promedio (últimos 30 días)
curl http://localhost:3001/api/metrics/lead-time

# Series de lead time por día
curl http://localhost:3001/api/metrics/lead-time/series

# Defect escape rate actual
curl http://localhost:3001/api/metrics/defect-escape

# Serie histórica de defects por batch
curl http://localhost:3001/api/metrics/defect-escape/series

# Deploy frequency por semana
curl http://localhost:3001/api/metrics/deploy-frequency
```

---

## 🔧 TROUBLESHOOTING

### "Cannot connect to SQL Server"
**Solución**: Verificar que:
1. SQL Server está corriendo
2. Instancia correcta en connection string (en `backend/src/db.js`)
3. Usuario/password son correctos

### "Port 3001 already in use"
**Solución**: Cambiar puerto en `backend/src/index.js` línea ~120

### "No data showing in frontend"
**Solución**: Verificar que:
1. Backend está corriendo: `npm run dev`
2. BD tiene datos: query en SQL Server
3. CORS activado (debería estarlo en `index.js`)

### Gráficos en blanco
**Solución**: Verificar en navegador (F12 → Console) por errores

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
kpi-dashboard/
├── backend/
│   ├── src/
│   │   ├── index.js (servidor Express)
│   │   ├── db.js (conexión SQL)
│   │   ├── metrics.controller.js (lógica KPI)
│   │   └── metrics.routes.js (API routes)
│   ├── package.json
│   └── node_modules/ (instalar con npm install)
│
├── frontend/
│   ├── index.html (layout HTML)
│   ├── css/style.css (estilos + colores)
│   ├── assets/app.js (lógica JavaScript)
│   └── (abierto en navegador, sin compilación)
│
├── sql/
│   ├── schema.sql (crear BD y tablas)
│   ├── seed.sql (cargar 60 tickets)
│   └── (ejecutar en SQL Server)
│
├── README.md (documentación completa)
├── CAMBIOS.md (registro de cambios)
├── ESTADO_IMPLEMENTACION.md (este archivo - resumen)
├── migrate-db.bat (script automático Windows)
└── migrate-db.sh (script automático Linux)
```

---

## ⏱️ TIEMPO ESTIMADO

| Tarea | Tiempo |
|-------|--------|
| Migrar BD | 1 minuto |
| npm install | 2 minutos |
| npm run dev | 1 minuto |
| Abrir frontend | Inmediato |
| **Total** | **~5 minutos** |

---

## ✅ CHECKLIST FINAL

- [ ] SQL Server corriendo
- [ ] `sql/schema.sql` ejecutado
- [ ] `sql/seed.sql` ejecutado
- [ ] BD `kpi_softprod` visible en SQL Server
- [ ] `npm install` completado en `backend/`
- [ ] `npm run dev` iniciado
- [ ] Frontend abierto en navegador
- [ ] Datos cargando correctamente
- [ ] Gráficos renderizando
- [ ] Colores correctos (verde/amarillo/rojo)

---

## 🎯 RESULTADO ESPERADO

![Expected View]
- Card "Lead Time": ~15 días (ROJO - Bajo rendimiento)
- Card "Defect Escape": 10% (AMARILLO - Intermedio)
- Gráfico de barras horizontal con colores
- Gauge doughnut con badge de status
- Serie histórica de 2 puntos
- Leyenda con explicación de colores

---

## 📝 PRÓXIMOS PASOS (Después de Validar)

1. **Cargar datos reales**: Insertar tickets reales en tabla `tickets`
2. **Ajustar thresholds**: Si los rangos de color no son los deseados, editar en `frontend/assets/app.js` (funciones `getLeadTimeColor()` y `getDefectColor()`)
3. **Integración Jira/DevOps**: Conectar a tu herramienta de desarrollo para datos automáticos
4. **Desplegar**: Llevar a producción en servidor

---

## 💡 TIPS

- El frontend NO necesita build process - funciona directo con HTML + JS
- Para testing, el seed.sql proporciona datos suficientes
- Todos los valores son realistas (lead times mixtos, defect rates intermedios)
- El código está completamente comentado para fácil customización

---

**¡Todo listo para usar!** 🎉

Ejecuta los 3 comandos del PASO 1-2 y abre el PASO 3 en navegador.
