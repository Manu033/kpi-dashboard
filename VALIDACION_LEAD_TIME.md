# 📊 VALIDACIÓN: LEAD TIME - Datos Esperados del Frontend

## 📈 Cálculo Teórico del Lead Time

**Fórmula**: `DATEDIFF(HOUR, started_at, deployed_at) / 24`

---

## 🔢 Análisis de los 60 Tickets

### Desglose por Rango de Lead Time

#### 🟢 ÉLITE (≤ 3 días)
Tickets con lead time ≤ 3 días:
- PROJ-031: 2025-09-01 → 2025-09-08 = **7 días** ❌
- PROJ-032: 2025-09-02 → 2025-09-08 = **6 días** ❌
- PROJ-033: 2025-09-03 → 2025-09-08 = **5 días** ❌

**Conteo ÉLITE**: 0 tickets

#### 🟡 INTERMEDIO (> 3 días y ≤ 7 días)
Tickets con 3 < lead time ≤ 7 días:
- PROJ-001: 2025-08-01 → 2025-08-18 = **17 días** ❌
- PROJ-004: 2025-08-04 → 2025-08-25 = **21 días** ❌
- PROJ-007: 2025-08-07 → 2025-08-25 = **18 días** ❌
- PROJ-009: 2025-08-09 → 2025-09-01 = **23 días** ❌
- PROJ-010: 2025-08-10 → 2025-09-01 = **22 días** ❌
- PROJ-014: 2025-08-14 → 2025-09-08 = **25 días** ❌
- PROJ-018: 2025-08-18 → 2025-09-15 = **28 días** ❌
- PROJ-022: 2025-08-22 → 2025-09-22 = **31 días** ❌

**Conteo INTERMEDIO**: 0 tickets (todos excepto el primero superan 7 días)

#### 🔴 CRÍTICO (> 7 días)
**Todos los 60 tickets tienen lead time > 7 días**

Ejemplos de cálculos:
- PROJ-001: Aug 1 → Aug 18 = 17 días
- PROJ-026: Aug 26 → Sep 29 = 34 días
- PROJ-060: Sep 30 → Oct 6 = 6 días ← **Uno de los mejores, aun > 7**

---

## 📊 LEAD TIME PROMEDIO GENERAL

### Cálculo Manual por Rango

**LOTE 1 (PROJ-001 a PROJ-030):**
```
Tickets por deployed_at:
- 2025-08-18: PROJ-001, PROJ-002, PROJ-003 
  - PROJ-001: 08-01 → 08-18 = 17 días
  - PROJ-002: 08-02 → 08-18 = 16 días
  - PROJ-003: 08-03 → 08-18 = 15 días
  
- 2025-08-25: PROJ-004, PROJ-005, PROJ-006, PROJ-007
  - PROJ-004: 08-04 → 08-25 = 21 días
  - PROJ-005: 08-05 → 08-25 = 20 días
  - PROJ-006: 08-06 → 08-25 = 19 días
  - PROJ-007: 08-07 → 08-25 = 18 días

- 2025-09-01: PROJ-008, PROJ-009, PROJ-010
  - PROJ-008: 08-08 → 09-01 = 24 días
  - PROJ-009: 08-09 → 09-01 = 23 días
  - PROJ-010: 08-10 → 09-01 = 22 días

[... (similar para los demás) ...]

- 2025-09-29: PROJ-026 a PROJ-030
  - PROJ-026: 08-26 → 09-29 = 34 días
  - PROJ-027: 08-27 → 09-29 = 33 días
  - PROJ-028: 08-28 → 09-29 = 32 días
  - PROJ-029: 08-29 → 09-29 = 31 días
  - PROJ-030: 08-30 → 09-29 = 30 días
```

**LOTE 2 (PROJ-031 a PROJ-060):**
```
Tickets por deployed_at:
- 2025-09-08: PROJ-031, PROJ-032, PROJ-033
  - PROJ-031: 09-01 → 09-08 = 7 días ✓ (INTERMEDIO!)
  - PROJ-032: 09-02 → 09-08 = 6 días ✓
  - PROJ-033: 09-03 → 09-08 = 5 días ✓

- 2025-09-15: PROJ-034 a PROJ-037
  - PROJ-034: 09-04 → 09-15 = 11 días
  - PROJ-035: 09-05 → 09-15 = 10 días
  - PROJ-036: 09-06 → 09-15 = 9 días
  - PROJ-037: 09-07 → 09-15 = 8 días

- 2025-09-22: PROJ-038 a PROJ-041
  - PROJ-038: 09-08 → 09-22 = 14 días
  - PROJ-039: 09-09 → 09-22 = 13 días
  - PROJ-040: 09-10 → 09-22 = 12 días
  - PROJ-041: 09-11 → 09-22 = 11 días

- 2025-09-29: PROJ-042 a PROJ-053
  - PROJ-042: 09-12 → 09-29 = 17 días
  - PROJ-043: 09-13 → 09-29 = 16 días
  - ... (13 tickets, rango 8-17 días)

- 2025-10-06: PROJ-054 a PROJ-060
  - PROJ-054: 09-24 → 10-06 = 12 días
  - PROJ-055: 09-25 → 10-06 = 11 días
  - PROJ-056: 09-26 → 10-06 = 10 días
  - PROJ-057: 09-27 → 10-06 = 9 días
  - PROJ-058: 09-28 → 10-06 = 8 días
  - PROJ-059: 09-29 → 10-06 = 7 días ✓ (INTERMEDIO!)
  - PROJ-060: 09-30 → 10-06 = 6 días ✓
```

### ✅ Promedio Estimado

**Total tickets**: 60
**Rango de lead time**: 5 a 34 días
**Promedio aproximado**: **~17-18 días**

**Por SQL Server query:**
```sql
SELECT AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 
FROM dbo.tickets
```

**Valor esperado**: ~17.5 días

---

## 🎨 QUÉ DEBERÍA VER EN EL FRONTEND

### Card: "Lead Time (días)"

```
┌─────────────────────────────────────┐
│  ⏱️ Lead Time (días)                │ ← Título
│                                     │
│  🔴 17.5 días                       │ ← Valor (ROJO porque > 7)
│  Bajo rendimiento                   │ ← Status badge (rojo)
│                                     │
│  [Gráfico de barras horizontal]     │ ← Gráfico Chart.js
│  ├─ 🔴 Bajo rendimiento (> 7d)   │
│  └─ 🟡 Intermedio (3-7d)          │
│     🟢 Élite (≤ 3d)               │
│                                     │
│  Tiempo promedio desde inicio       │ ← Descripción
│  hasta despliegue en producción     │
│  Meta: ≤ 7 días (Intermedio)       │ ← Meta
│        ≤ 3 días (Élite)            │
└─────────────────────────────────────┘
```

### Valores Específicos en el Gráfico

El gráfico debería mostrar 3 barras horizontales:
1. **Élite (≤ 3 días)**: 0 tickets → Barra muy pequeña o inexistente 🟢
2. **Intermedio (3-7 días)**: ~5 tickets → Barra pequeña 🟡
3. **Crítico (> 7 días)**: ~55 tickets → Barra grande 🔴

```
Distribución Visual en el Gráfico:
┌─ Élite (≤ 3d)     │                    🟢
├─ Intermedio (3-7d) │█████               🟡
└─ Crítico (> 7d)    │█████████████████ 🔴
                      0      20      40  60
```

---

## 🔍 COLOR DEL BADGE

**Lead Time Promedio: 17.5 días**
- ✅ > 7 días → 🔴 **Rojo - "Bajo rendimiento"**
- ❌ No es Intermedio (< 7 días)
- ❌ No es Élite (< 3 días)

**Badge esperado**: 🔴 **CRÍTICO** o **"Bajo rendimiento"**

---

## 📋 DESGLOSE COMPLETO DE TODOS LOS 60 TICKETS

| Ticket | Start | Deploy | Lead (días) | Status | Batch |
|--------|-------|--------|-------------|--------|-------|
| PROJ-001 | 08-01 | 08-18 | 17 | 🔴 Crítico | 1 |
| PROJ-002 | 08-02 | 08-18 | 16 | 🔴 Crítico | 1 |
| PROJ-003 | 08-03 | 08-18 | 15 | 🔴 Crítico | 1 |
| PROJ-004 | 08-04 | 08-25 | 21 | 🔴 Crítico | 1 |
| PROJ-005 | 08-05 | 08-25 | 20 | 🔴 Crítico | 1 |
| ... | ... | ... | ... | ... | ... |
| PROJ-031 | 09-01 | 09-08 | 7 | 🟡 Intermedio | 2 |
| PROJ-032 | 09-02 | 09-08 | 6 | 🟡 Intermedio | 2 |
| PROJ-033 | 09-03 | 09-08 | 5 | 🟡 Intermedio | 2 |
| ... | ... | ... | ... | ... | ... |
| PROJ-060 | 09-30 | 10-06 | 6 | 🟡 Intermedio | 2 |

**Resumen:**
- 🔴 Crítico: ~55 tickets (lead time > 7 días)
- 🟡 Intermedio: ~5 tickets (lead time 3-7 días)
- 🟢 Élite: 0 tickets (lead time ≤ 3 días)

---

## ✅ CHECKLIST: Lo que Deberías Ver

- [ ] **Valor Principal**: 17-18 días (aproximadamente)
- [ ] **Color**: 🔴 Rojo (porque > 7 días)
- [ ] **Badge**: "Bajo rendimiento" o "Crítico"
- [ ] **Gráfico**: 3 barras - Élite (vacío), Intermedio (pequeño), Crítico (grande)
- [ ] **Leyenda**: Explicación de colores semáforo
- [ ] **Meta visible**: "≤ 7 días (Intermedio) | ≤ 3 días (Élite)"

---

## 🎯 Conclusión

**El Lead Time promedio debería ser ~17.5 días con color ROJO**

Esto es intencional en los datos de prueba para demostrar:
- ✅ Sistema correctamente clasifica lead time alto
- ✅ Badge de status funciona (rojo para crítico)
- ✅ Gráfico distribuye tickets en rangos correctos
- ✅ Color semáforo se aplica correctamente
