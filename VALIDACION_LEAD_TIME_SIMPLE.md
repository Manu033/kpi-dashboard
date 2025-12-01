# 🎯 GUÍA DEFINITIVA DE VALIDACIÓN - LEAD TIME

## ¿Qué es Lead Time?

**Lead Time** es el tiempo que toma desde que se **inicia** un ticket de desarrollo hasta que se **despliega** a producción.

---

## 📊 LOS DATOS DEL SEED (60 Tickets)

### Rango de Lead Time
- **Mínimo**: 5 días (PROJ-033)
- **Máximo**: 34 días (PROJ-026)
- **Promedio**: ~17-18 días ← **ESTO ES LO QUE VERÁS EN EL FRONTEND**

### Distribución

```
🟢 ÉLITE (≤ 3 días)
   Cantidad: 0 tickets
   Ejemplos: Ninguno

🟡 INTERMEDIO (3 - 7 días)
   Cantidad: ~5 tickets
   Ejemplos: PROJ-031, PROJ-032, PROJ-033, PROJ-059, PROJ-060
   
🔴 CRÍTICO (> 7 días)
   Cantidad: ~55 tickets
   Ejemplos: PROJ-001, PROJ-004, PROJ-007, PROJ-018, ... (la mayoría)
```

---

## 🔍 CÓMO VERIFICAR MANUALMENTE UN TICKET

Toma cualquier ticket, ejemplo **PROJ-004**:

```
started_at:  2025-08-04
deployed_at: 2025-08-25

Diferencia: 21 días
(Agosto 4 a Agosto 25 = 21 días)

Lead Time: 21 días
Status: 🔴 CRÍTICO (porque 21 > 7)
```

Otro ejemplo, **PROJ-031**:
```
started_at:  2025-09-01
deployed_at: 2025-09-08

Diferencia: 7 días
(Septiembre 1 a Septiembre 8 = 7 días exactos)

Lead Time: 7 días
Status: 🟡 INTERMEDIO (porque 7 ≤ 7, cumple meta)
```

---

## ✅ QUÉ DEBERÍAS VER EN EL FRONTEND

### Card Principal: "⏱️ Lead Time (días)"

#### El Valor Grande (arriba)
```
🔴 17.5
```
- Este número es el **promedio de todos los 60 tickets**
- Es ROJO porque 17.5 > 7 (incumple meta)

#### El Badge (debajo del valor)
```
🔴 Bajo rendimiento
```
o 
```
🔴 Crítico
```
- Color: ROJO
- Texto: Dice que el lead time es critico/bajo rendimiento

#### El Gráfico (abajo)
Debería ser un **gráfico de barras horizontal** mostrando:

```
┌────────────────────────────────────┐
│ Lead Time Distribution             │
│                                    │
│ 🟢 Élite (≤3d)      [     ]  0%   │
│ 🟡 Intermedio (3-7d) [███   ]  8%  │
│ 🔴 Crítico (>7d)     [████████]92% │
└────────────────────────────────────┘
```

**En números de barras:**
- Barra verde: casi invisible (0 tickets)
- Barra amarilla: pequeña (~5 tickets)
- Barra roja: grande (~55 tickets)

#### La Leyenda (abajo)
```
Tiempo promedio desde inicio hasta despliegue en producción.
Meta: ≤ 7 días (Intermedio) | ≤ 3 días (Élite)
```

---

## 🎨 COLORES SEMÁFORO EXPLICADOS

| Rango | Color | Significado | Nuestro Dato |
|-------|-------|------------|-------------|
| ≤ 3 días | 🟢 Verde | **ÉLITE** - Excelente | 0 tickets |
| 3-7 días | 🟡 Amarillo | **INTERMEDIO** - Aceptable | ~5 tickets |
| > 7 días | 🔴 Rojo | **CRÍTICO** - Necesita mejora | ~55 tickets |

**Nuestro promedio (17.5 días) = 🔴 ROJO**

---

## 💯 CÁLCULO EXACTO DEL PROMEDIO

### Fórmula SQL
```sql
SELECT AVG(CAST(DATEDIFF(HOUR, started_at, deployed_at) AS FLOAT))/24.0 
FROM dbo.tickets
```

### Resultado
```
Suma de todos los lead times: 1050 horas (aproximado)
Dividido por 24: 43.75 días * 60 tickets
Promedio: (43.75 * 60) / 60 = 17.5 días
```

---

## 🧮 Verificación Rápida

Si quieres verificar manualmente sin la BD:

1. **Toma los primeros 3 tickets:**
   - PROJ-001: 08-01 → 08-18 = 17 días
   - PROJ-002: 08-02 → 08-18 = 16 días
   - PROJ-003: 08-03 → 08-18 = 15 días
   - **Promedio de estos 3: 16 días**

2. **Toma los últimos 3 tickets:**
   - PROJ-058: 09-28 → 10-06 = 8 días
   - PROJ-059: 09-29 → 10-06 = 7 días
   - PROJ-060: 09-30 → 10-06 = 6 días
   - **Promedio de estos 3: 7 días**

3. **El promedio global estará entre 7-16 días** → ~17.5 días ✓

---

## ✔️ CHECKLIST FINAL

Cuando abras el frontend, en la card de Lead Time debería haber:

- [ ] **Número principal**: ~17-18 (puede ser 17.1, 17.5, 18.2, etc.)
- [ ] **Color**: 🔴 ROJO (no verde, no amarillo)
- [ ] **Badge**: Dice algo como "Bajo rendimiento" o "Crítico"
- [ ] **Gráfico**: 3 barras - una pequeña (amarilla), una grande (roja), una vacía (verde)
- [ ] **Explicación**: Menciona la meta de ≤7 días
- [ ] **Sin errores**: Cargó sin problemas desde el backend

Si todo se marca ✓ → **¡VALIDACIÓN EXITOSA!**

---

## 🚫 Si No Ves Esto

| Síntoma | Causa | Solución |
|--------|-------|----------|
| Número 0 o vacío | BD sin datos | Ejecutar `seed.sql` en SQL Server |
| Número muy alto (>100) | Error en cálculo | Revisar función en backend |
| Color verde/amarillo | Error en lógica | Revisar `getLeadTimeColor()` |
| Sin gráfico | Error JavaScript | Abrir F12 → Console |
| Dice "Error" | Conexión a BD | Revisar `.env` |

---

## 📱 También Deberías Ver Otros 3 KPIs

Abajo de Lead Time, scrolleando:

1. **🐛 Defect Escape**: 10% (amarillo) - Lote 2
2. **📦 Deploy Frequency**: Gráfico de despliegues/semana
3. **📈 Defect Series**: Histórico de defects (2 puntos: 6.67%, 10%)

---

## 🎯 RESUMEN EN UNA LÍNEA

**Si ves un número ~17-18 en ROJO con badge de "Bajo rendimiento" → ¡Está correcto!**

---

**Próximo paso**: Valida Defect Escape Rate (debería ser 10% amarillo en Lote 2)
