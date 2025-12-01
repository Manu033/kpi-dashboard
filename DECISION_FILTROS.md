# 🤔 ¿FILTRAR POR FECHAS O POR BATCHES?

## Análisis de Opciones

### OPCIÓN 1: Filtrar por Fechas (Actual)

```
Filtros: [Desde: 01/08/2025] [Hasta: 30/08/2025]
```

**Pros:**
- ✅ Estándar en la mayoría de dashboards
- ✅ Flexible para análisis histórico
- ✅ Fácil de entender para usuarios
- ✅ Permite comparar períodos específicos

**Contras:**
- ❌ Lead Time está OK (suma tickets en rango)
- ❌ **Defect Escape QUEBRADO** - Los batches NO respetan fechas
  - Batch 1 tiene tickets de 08-01 a 09-29 (¡59 días!)
  - Si filtras 08-01 a 08-31, solo ves parte del batch
  - El defect rate se calcula MAL

---

### OPCIÓN 2: Filtrar por Batches (Mejor)

```
Filtros: [Batch: Todos ▼] o [Batch 1] [Batch 2]
```

**Pros:**
- ✅ **Defect Escape CORRECTO** - Muestra % de bugs del batch completo
- ✅ Alinea con cómo se miden defectos (30 items = 1 batch)
- ✅ Más natural para el negocio (entregas, no fechas)
- ✅ No hay ambigüedad (batch es discreto)

**Contras:**
- ❌ Lead Time menos flexible (pero igual funciona)
- ❌ Usuarios acostumbrados a fechas pueden confundirse

---

## 🎯 RECOMENDACIÓN

### **Opción 2: Filtrar por Batches** ← **MEJOR**

**Razón Principal:** Tu KPI de Defect Escape se define por BATCH, no por fecha:

```sql
-- Correcto: por batch
SELECT 
  batch_number,
  (total_bugs_escaped / 30) * 100 AS escape_rate
FROM dbo.batches
WHERE batch_number IN (1, 2, ...)

-- Incorrecto: por fecha
SELECT 
  COUNT(*) as bugs,
  (COUNT(*) / 30) * 100 as rate
FROM dbo.tickets
WHERE found_in_production_at BETWEEN @start AND @end
-- ^^^ Esto NO agrupa por 30 items, es arbritario
```

---

## 📊 Tabla Comparativa

| Aspecto | Por Fechas | Por Batches |
|---------|-----------|-----------|
| **Lead Time** | ✅ OK | ✅ OK |
| **Defect Escape** | ❌ INCORRECTO | ✅ CORRECTO |
| **Deploy Frequency** | ✅ OK | ✅ OK |
| **Facilidad** | Fácil | Moderado |
| **Alineación negocio** | Media | ✅ Alta |
| **Almacenamiento** | ❌ Requiere cálculo | ✅ Ya en BD |

---

## 🔧 Implementación Recomendada

### Nuevo Selector en HTML

```html
<div class="col-auto">
  <label class="form-label">Batch</label>
  <select id="batchFilter" class="form-control">
    <option value="">Todos los batches</option>
    <option value="1">Batch 1</option>
    <option value="2">Batch 2</option>
    <option value="3">Batch 3</option>
  </select>
</div>
```

### Función para construir query string

```javascript
function currentFilter() {
  const batch = document.getElementById('batchFilter').value;
  const qs = [];
  if (batch) qs.push(`batch=${batch}`);
  return qs.length ? `?${qs.join('&')}` : '';
}

// Usar en lugar de currentRange()
const url = `${API}/defect-escape${currentFilter()}`;
```

### Endpoints Backend (adaptados)

```javascript
// GET /api/metrics/defect-escape?batch=2
// Retorna: escape_rate, batch_number, status

// GET /api/metrics/lead-time?batch=2
// Retorna: lead_time promedio de tickets en ese batch
```

---

## 🎨 Interfaz Visual

### Antes (Fechas)
```
┌─────────────────────────────────────┐
│ Desde: [01/08/2025]  Hasta: [30/08] │
│            [Actualizar]             │
└─────────────────────────────────────┘
```

### Después (Batches)
```
┌─────────────────────────────────────┐
│ Batch: [Todos ▼]                    │
│            [Actualizar]             │
│                                     │
│ Mostrando 2 de 2 batches cerrados   │
└─────────────────────────────────────┘
```

---

## 📌 Decisión Final

**Para tu caso específico:**

```
✅ FILTRAR POR BATCHES
   - Porque: Defect Escape se define por batch (30 items)
   - Porque: Ya tienes tabla batches con datos cerrados
   - Porque: Es más preciso para el negocio
   - Porque: Lead Time igual funciona bien
```

**Mantén fechas como SECUNDARIA** (opcional, para análisis):
- Si usuario quiere ver "Lead Time de agosto"
- Pero principal es batch-based

---

## 🚀 Cambios Necesarios

1. **HTML**: Reemplazar selector de fechas por selector de batch
2. **JS**: Cambiar `currentRange()` → `currentFilter()`
3. **Backend**: Adaptar endpoints para `?batch=X`
4. **CSS**: Actualizar estilos si es necesario

---

## ⚠️ Implicación para Tus Datos

```
Batch 1:
├─ Tickets: 30 (PROJ-001 a PROJ-030)
├─ Lead Time: variable (depende de tickets individuales)
├─ Escape Rate: 6.67% (2 bugs de 30)
└─ Estado: Cerrado (terminado)

Batch 2:
├─ Tickets: 30 (PROJ-031 a PROJ-060)
├─ Lead Time: variable
├─ Escape Rate: 10% (3 bugs de 30)
└─ Estado: Cerrado

Batch 3+:
├─ Status: Abierto (en proceso)
└─ Escapa Rate: Se calcula cuando cierre
```

**Con filtro por batch:**
- Usuario ve: "Batch 1: Lead Time X, Defect Rate 6.67%"
- Usuario ve: "Batch 2: Lead Time Y, Defect Rate 10%"
- **Ambos valores son CORRECTOS y DISCRETOS**

---

## ✅ Conclusión

**Usa BATCHES** como filtro principal porque:
1. ✅ Aligns con definición de Defect Escape (30 items = 1 batch)
2. ✅ Datos están organizados así en la BD
3. ✅ Lead Time funciona igual de bien
4. ✅ Es más profesional/preciso

**Fechas pueden ser secundarias/futuras** para análisis adicionales.
