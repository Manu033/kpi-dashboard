const API = 'http://localhost:3001/api/metrics';

let leadTimeChart, deployFreqChart, defectGauge, defectSeriesChart;

function fmtDate(d) { return d?.toISOString?.().slice(0,10); }

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

// Cargar batches dinámicamente
async function loadBatches() {
  try {
    const batches = await fetchJSON(`${API}/batches`);
    const select = document.getElementById('batchFilter');
    
    // Limpiar opciones existentes excepto la primera (Todos los batches)
    while (select.options.length > 1) {
      select.remove(1);
    }
    
    // Agregar cada batch como opción
    batches.forEach(batch => {
      const option = document.createElement('option');
      option.value = batch.id;
      option.textContent = batch.label;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading batches:', err);
  }
}

function currentFilter() {
  const batch = document.getElementById('batchFilter')?.value;
  if (batch) return `?batch=${batch}`;
  return '';
}

async function updateBatchDateRange() {
  const batch = document.getElementById('batchFilter')?.value;
  const elem = document.getElementById('batchDateRange');
  
  if (!batch) {
    elem.textContent = '';
    return;
  }
  
  try {
    const info = await fetchJSON(`${API}/batch-info?batch=${batch}`);
    if (info.first_ticket_date && info.last_ticket_date) {
      const from = new Date(info.first_ticket_date).toLocaleDateString('es-ES');
      const to = new Date(info.last_ticket_date).toLocaleDateString('es-ES');
      elem.textContent = `📅 ${from} al ${to}`;
    } else {
      elem.textContent = '';
    }
  } catch (err) {
    console.error('Error fetching batch info:', err);
    elem.textContent = '';
  }
}

// Función para obtener color según benchmark
function getLeadTimeColor(days) {
  if (days <= 3) return { bg: '#10b981', border: '#059669', text: 'Élite' };        // verde
  if (days <= 7) return { bg: '#f59e0b', border: '#d97706', text: 'Intermedio' };   // amarillo
  return { bg: '#ef4444', border: '#dc2626', text: 'Bajo rendimiento' };            // rojo
}

function getDefectColor(pct, status) {
  if (status === 'elite') return { bg: '#10b981', border: '#059669', text: 'Élite' };
  if (status === 'intermediate') return { bg: '#f59e0b', border: '#d97706', text: 'Intermedio' };
  return { bg: '#ef4444', border: '#dc2626', text: 'Crítico' };
}

async function loadLeadTime() {
  // 1) valor promedio
  const v = await fetchJSON(`${API}/lead-time${currentFilter()}`);
  const color = getLeadTimeColor(v.value);
  
  const elem = document.getElementById('leadTimeValue');
  elem.textContent = (v.value || 0).toFixed(2);
  elem.parentElement.style.borderLeft = `4px solid ${color.bg}`;
  
  // Agregar badge de status
  let statusBadge = elem.parentElement.querySelector('.status-badge');
  if (!statusBadge) {
    statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';
    elem.parentElement.appendChild(statusBadge);
  }
  statusBadge.textContent = color.text;
  statusBadge.style.color = color.bg;

  // 2) Agrupar por categoría de lead time
  const series = await fetchJSON(`${API}/lead-time/by-ticket${currentFilter()}`);
  
  // Contar tickets en cada categoría
  let elite = 0, intermediate = 0, critical = 0;
  for (const r of series) {
    const days = Number(r.lead_time_days || 0);
    if (days <= 3) elite++;
    else if (days <= 7) intermediate++;
    else critical++;
  }
  
  const total = series.length || 1;
  const labels = ['Élite (≤3d)', 'Intermedio (3-7d)', 'Crítico (>7d)'];
  const data = [elite, intermediate, critical];
  const percentages = [
    ((elite / total) * 100).toFixed(1),
    ((intermediate / total) * 100).toFixed(1),
    ((critical / total) * 100).toFixed(1)
  ];

  if (leadTimeChart) leadTimeChart.destroy();
  leadTimeChart = new Chart(document.getElementById('leadTimeChart'), {
    type: 'bar',
    data: { 
      labels, 
      datasets: [
        { 
          label: 'Tickets', 
          data,
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderColor: ['#059669', '#d97706', '#dc2626'],
          borderWidth: 1,
          borderRadius: 4
        }
      ] 
    },
    options: {
      indexAxis: 'y',
      responsive: true, 
      maintainAspectRatio: false,
      scales: { 
        x: { 
          beginAtZero: true,
          ticks: { callback: v => v }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const idx = item.dataIndex;
              return `${data[idx]} tickets (${percentages[idx]}%)`;
            }
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'right',
          formatter: (v, ctx) => {
            const idx = ctx.dataIndex;
            return `${v} (${percentages[idx]}%)`;
          },
          font: { size: 11, weight: 'bold' }
        }
      }
    }
  });
}

async function loadDeployFrequency() {
  const TARGET = 1;
  const rows = await fetchJSON(`${API}/deploy-frequency`);

  const labels = rows.map(r => {
    const [year, week] = String(r.yw).split('-');
    return `Sem ${week}`;
  });
  const data = rows.map(r => Number(r.deployments));

  // Promedio móvil de 4 semanas
  const rolling = data.map((_, i) => {
    const from = Math.max(0, i - 3);
    const slice = data.slice(from, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    return Number(avg.toFixed(2));
  });

  const goal = labels.map(() => TARGET);
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
          backgroundColor: '#3b82f6',
          borderColor: '#1e40af',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.7
        },
        {
          type: 'line',
          label: 'Media 4 semanas',
          data: rolling,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#6d28d9',
          borderWidth: 2,
          borderColor: '#8b5cf6',
          fill: false
        },
        {
          type: 'line',
          label: 'Objetivo',
          data: goal,
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 2,
          borderColor: '#10b981',
          fill: false
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
          ticks: { stepSize: 1 }
        },
        x: {
          grid: { display: false }
        }
      },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            afterLabel: (item) => {
              if (item.datasetIndex === 0) {
                return `Meta: ${TARGET}`;
              }
            }
          }
        }
      }
    }
  });
}

async function loadDefectEscape() {
  const v = await fetchJSON(`${API}/defect-escape${currentFilter()}`);
  const color = getDefectColor(v.value, v.status);
  
  const elem = document.getElementById('defectEscapeValue');
  elem.textContent = v.value.toFixed(2) + '%';
  elem.parentElement.style.borderLeft = `4px solid ${color.bg}`;
  
  let statusBadge = elem.parentElement.querySelector('.status-badge');
  if (!statusBadge) {
    statusBadge = document.createElement('span');
    statusBadge.className = 'status-badge';
    elem.parentElement.appendChild(statusBadge);
  }
  statusBadge.textContent = color.text;
  statusBadge.style.color = color.bg;
  
  // Lote info
  let batchInfo = elem.parentElement.querySelector('.batch-info');
  if (!batchInfo) {
    batchInfo = document.createElement('div');
    batchInfo.className = 'batch-info';
    elem.parentElement.appendChild(batchInfo);
  }
  batchInfo.textContent = `Lote ${v.batch_number || '—'}`;
  batchInfo.style.fontSize = '12px';
  batchInfo.style.color = '#666';

  // Gráfico de gauge tipo semicírculo mejorado
  if (defectGauge) defectGauge.destroy();
  
  // Crear un gráfico tipo doughnut circular pero estilizado
  defectGauge = new Chart(document.getElementById('defectGauge'), {
    type: 'doughnut',
    data: {
      labels: ['Defectos', 'OK'],
      datasets: [{
        data: [v.value, 100 - v.value],
        backgroundColor: [color.bg, '#e5e7eb'],
        borderColor: ['#fff', '#fff'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              return item.label + ': ' + item.parsed + '%';
            }
          }
        }
      }
    }
  });
}

async function loadDefectSeries() {
  const series = await fetchJSON(`${API}/defect-escape/series`);
  
  if (series.length === 0) return;
  
  const labels = series.map(r => `Lote ${r.batch_number}`);
  const data = series.map(r => Number(r.escape_rate));
  
  if (defectSeriesChart) defectSeriesChart.destroy();
  
  defectSeriesChart = new Chart(document.getElementById('defectSeriesChart'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Tasa de escape (%)',
        data,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderColor: '#ef4444',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#dc2626',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: 30,
          ticks: { callback: v => v + '%' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => item.parsed.y.toFixed(2) + '%'
          }
        }
      }
    }
  });
}

async function loadAll() {
  await Promise.all([
    loadLeadTime(), 
    loadDeployFrequency(), 
    loadDefectEscape(),
    loadDefectSeries()
  ]);
}

document.getElementById('filters').addEventListener('submit', (e) => {
  e.preventDefault();
  updateBatchDateRange();
  loadAll().catch(console.error);
});

// Event listener para actualizar fechas cuando se cambia el batch
document.getElementById('batchFilter').addEventListener('change', updateBatchDateRange);

// Cargar batches al iniciar
loadBatches();

// Inicializar batch por defecto
document.getElementById('batchFilter').value = '';

loadAll().catch(console.error);
