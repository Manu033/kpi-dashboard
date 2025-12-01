const API = 'http://localhost:3001/api/metrics';

let leadTimeChart, deployFreqChart, defectGauge, defectSeriesChart;

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
  const v = await fetchJSON(`${API}/lead-time${currentRange()}`);
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

  // 2) serie por ticket
  const series = await fetchJSON(`${API}/lead-time/by-ticket${currentRange()}`);

  const labels = series.map(r => r.key_code);
  const data   = series.map(r => Number(r.lead_time_days?.toFixed(2)));

  if (leadTimeChart) leadTimeChart.destroy();
  leadTimeChart = new Chart(document.getElementById('leadTimeChart'), {
    type: 'bar',
    data: { 
      labels, 
      datasets: [
        { 
          label: 'Lead Time (días)', 
          data,
          backgroundColor: data.map(d => {
            if (d <= 3) return '#10b981';
            if (d <= 7) return '#f59e0b';
            return '#ef4444';
          }),
          borderColor: '#e5e7eb',
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
          ticks: { callback: v => v + 'd' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const days = item.parsed.x;
              const status = days <= 3 ? 'Élite' : days <= 7 ? 'Intermedio' : 'Bajo';
              return `${days} días (${status})`;
            }
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'right',
          formatter: (v) => v + 'd',
          font: { size: 10, weight: 'bold' }
        }
      }
    }
  });
}

async function loadDeployFrequency() {
  const TARGET = 1;
  const rows = await fetchJSON(`${API}/deploy-frequency${currentRange()}`);

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
  const v = await fetchJSON(`${API}/defect-escape`);
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
  loadAll().catch(console.error);
});

// Prefill rango último mes
const today = new Date();
const from = new Date(Date.now() - 30*24*3600*1000);
document.getElementById('from').value = fmtDate(from);
document.getElementById('to').value = fmtDate(today);

loadAll().catch(console.error);
