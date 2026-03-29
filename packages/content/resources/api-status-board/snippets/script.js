const SERVICES = [
  { name: 'API Gateway',        status: 'op',  uptime: '99.98%' },
  { name: 'Authentication',     status: 'op',  uptime: '100.0%' },
  { name: 'Database Cluster',   status: 'dg',  uptime: '99.41%' },
  { name: 'Storage Service',    status: 'op',  uptime: '99.99%' },
  { name: 'Email Delivery',     status: 'op',  uptime: '99.87%' },
  { name: 'CDN',                status: 'op',  uptime: '100.0%' },
  { name: 'Search Index',       status: 'dn',  uptime: '97.23%' },
  { name: 'Webhooks',           status: 'op',  uptime: '99.94%' },
];

const INCIDENTS = [
  {
    status: 'ongoing',
    title: 'Search Index elevated error rate',
    date: 'Mar 6, 2026',
    body: 'We are investigating increased error rates on the search service. API and authentication are unaffected. Updates every 30 minutes.'
  },
  {
    status: 'monitoring',
    title: 'Database Cluster degraded performance',
    date: 'Mar 6, 2026',
    body: 'Slow query times observed on shard 3 of the primary database cluster. A fix has been deployed and we are monitoring recovery.'
  },
  {
    status: 'resolved',
    title: 'API Gateway intermittent 502 errors',
    date: 'Mar 4, 2026',
    body: 'An edge node misconfiguration caused intermittent 502 errors for ~8% of requests for 14 minutes. Resolved at 03:47 UTC.'
  },
];

// Render services
const serviceList = document.getElementById('serviceList');
SERVICES.forEach(({ name, status, uptime }) => {
  const labelMap = { op: 'Operational', dg: 'Degraded', dn: 'Outage' };
  const cls = { op: 's-op', dg: 's-dg', dn: 's-dn' }[status];
  serviceList.innerHTML += `
    <div class="service-row">
      <span class="service-dot dot-${status}"></span>
      <span class="service-name">${name}</span>
      <span class="service-status ${cls}">${labelMap[status]}</span>
      <span class="service-uptime">${uptime}</span>
    </div>
  `;
});

// Render uptime bars (90 days, mostly operational)
const grid = document.getElementById('uptimeGrid');
const pattern = Array.from({ length: 90 }, (_, i) => {
  if (i === 84 || i === 85) return 'dg';
  if (i === 86) return 'dn';
  if (i === 60) return 'dg';
  return 'op';
});
pattern.forEach(s => {
  const bar = document.createElement('div');
  bar.className = 'uptime-bar' + (s !== 'op' ? ` ${s}` : '');
  bar.title = s === 'op' ? 'Operational' : (s === 'dg' ? 'Degraded' : 'Outage');
  grid.appendChild(bar);
});

// Render incidents
const incidentList = document.getElementById('incidentList');
INCIDENTS.forEach(({ status, title, date, body }) => {
  const badgeCls = `badge-${status}`;
  const label = status === 'ongoing' ? 'Ongoing' : (status === 'monitoring' ? 'Monitoring' : 'Resolved');
  incidentList.innerHTML += `
    <div class="incident-card">
      <div class="incident-header">
        <span class="incident-badge ${badgeCls}">${label}</span>
        <span class="incident-title">${title}</span>
        <span class="incident-date">${date}</span>
      </div>
      <p class="incident-body">${body}</p>
    </div>
  `;
});

// Overall hero
const hasOutage = SERVICES.some(s => s.status === 'dn');
const hasDegraded = SERVICES.some(s => s.status === 'dg');
const hero = document.getElementById('heroBar');
const heroTitle = document.getElementById('heroTitle');
const heroIcon = document.getElementById('heroIcon');
if (hasOutage) {
  hero.classList.add('outage');
  heroTitle.textContent = 'Partial System Outage';
  heroIcon.textContent = '!';
} else if (hasDegraded) {
  hero.classList.add('degraded');
  heroTitle.textContent = 'Degraded Performance';
  heroIcon.textContent = '~';
}
