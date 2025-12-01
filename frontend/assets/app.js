const API = 'http://localhost:3001/api/metrics';

let leadTimeChart, deployFreqChart, defectGauge;

function fmtDate(d) { return d?.toISOString?.().slice(0,10); }

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function currentRange() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const qs = [];
  if (from) qs.push(`from=${from}`);
  if (to) qs.push(`to=${to}`);
  return qs.length ? `?${qs.join('&')}` : '';
}

async function loadLeadTime() {
  // 1) valor promedio
  const v = await fetchJSON(`${API}/lead-time${currentRange()}`);
  document.getElementById('leadTimeValue').textContent = (v.value || 0).toFixed(2);

  // 2) serie por ticket
  const series = await fetchJSON(`${API}/lead-time/by-ticket${currentRange()}`);


  const labels = series.map(r => r.key_code);
  const data   = series.map(r => Number(r.lead_time_days?.toFixed(2)));

  if (leadTimeChart) leadTimeChart.destroy();
  leadTimeChart = new Chart(document.getElementById('leadTimeChart'), {
    type: 'line',
    data: { labels, datasets: [{ label: 'Lead Time (días)', data }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { x: { ticks: { maxRotation: 0, autoSkip: true } } },
      plugins: {
        // tooltip muestra el código completo (PROJ-101)
        tooltip: {
          callbacks: {
            title: (items) => {
              const idx = items[0].dataIndex;
              return series[idx].key_code;  // 'PROJ-101'
            }
          }
        }
      }
    }
  });
}

async function loadDeployFrequency() {
  const TARGET = 1; // objetivo de deploys/semana (ajustá a gusto)

  const rows = await fetchJSON(`${API}/deploy-frequency${currentRange()}`);

  // Etiquetas "Sem 34 2025", etc.
  const labels = rows.map(r => {
    const [year, week] = String(r.yw).split('-');
    return `Sem ${week} ${year}`;
  });
  const data = rows.map(r => Number(r.deployments));

  // Promedio móvil de 4 semanas (rolling)
  const rolling = data.map((_, i) => {
    const from = Math.max(0, i - 3);
    const slice = data.slice(from, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Number(avg.toFixed(2));
  });

  // Línea horizontal de objetivo
  const goal = labels.map(() => TARGET);

  // Ajuste de eje Y (enteros, buen tope)
  const yMax = Math.max(...data, TARGET) + 0.5;

  if (deployFreqChart) deployFreqChart.destroy();
  deployFreqChart = new Chart(document.getElementById('deployFreqChart'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Deploys/semana',
          data,
          borderWidth: 1,
          borderRadius: 6,
          // No seteo colores custom para mantener paleta default de Chart.js
        },
        {
          type: 'line',
          label: 'Media 4 semanas',
          data: rolling,
          tension: 0.3,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          type: 'line',
          label: 'Objetivo',
          data: goal,
          borderDash: [6, 6],
          pointRadius: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: yMax,
          ticks: { stepSize: 1, precision: 0 }
        },
        x: {
          grid: { display: false },
          ticks: { maxRotation: 0, autoSkip: true }
        }
      },
      layout: { padding: { top: 8, right: 8, bottom: 8, left: 8 } },
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => [
              `Deploys: ${data[item.dataIndex]}`,
              `Media 4s: ${rolling[item.dataIndex]}`,
              `Objetivo: ${TARGET}`
            ]
          }
        },
        // Mostrar valores sobre las barras (si agregaste el plugin)
        datalabels: {
          anchor: 'end',
          align: 'top',
          formatter: (v) => v, // muestra el número tal cual
          clamp: true
        }
      },
      datasets: {
        bar: {
          barPercentage: 0.6,
          categoryPercentage: 0.8
        }
      }
    }
  });
}


async function loadDefectEscape() {
  const v = await fetchJSON(`${API}/defect-escape${currentRange()}`);
  document.getElementById('defectEscapeValue').textContent = v.value.toFixed(2) + '%';

  if (defectGauge) defectGauge.destroy();
  defectGauge = new Chart(document.getElementById('defectGauge'), {
    type: 'doughnut',
    data: {
      labels: ['Defectos', 'OK'],
      datasets: [{ data: [v.value, 100 - v.value] }]
    },
    options: { cutout: '70%', plugins: { legend: { display: false } } }
  });
}

async function loadAll() {
  await Promise.all([loadLeadTime(), loadDeployFrequency(), loadDefectEscape()]);
}

// --- NUEVO: formateo de '2025-09-01T00:00:00.000Z' -> '01/09/2025'
function fmtISODateToDMY(iso) {
  const s = String(iso);              // viene como string ISO
  const base = s.length >= 10 ? s.slice(0, 10) : s; // 'YYYY-MM-DD'
  const [y, m, d] = base.split('-');
  return `${d}/${m}/${y}`;
}

document.getElementById('filters').addEventListener('submit', (e) => {
  e.preventDefault();
  loadAll().catch(console.error);
});

// Prefill rango último mes
const today = new Date();
const from = new Date(Date.now() - 30*24*3600*1000);
document.getElementById('from').value = fmtDate(from);
document.getElementById('to').value = fmtDate(today);

loadAll().catch(console.error);
