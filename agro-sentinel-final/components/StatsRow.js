'use client'

function StatCard({ value, label, sub, accent, icon, delay }) {
  return (
    <div className="bento-card" style={{
      padding: '20px 24px',
      flex: 1,
      minWidth: 180, // Am mărit puțin pentru a nu tăia textul la Imperial
      animation: `slideUp 0.5s ease-out ${delay}s both`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'rgba(232,245,233,0.45)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>{label}</div>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 28, // Scăzut de la 32 pentru a încăpea numerele mai lungi
        fontWeight: 700,
        color: accent || '#E8F5E9',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }} className="stat-number">{value}</div>
      {sub && (
        <div style={{
          marginTop: 6,
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'rgba(232,245,233,0.4)',
        }}>{sub}</div>
      )}
    </div>
  )
}

function calculateHectares(coords) {
  if (!coords || coords.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    let j = (i + 1) % coords.length;
    area += coords[i].lng * coords[j].lat;
    area -= coords[j].lng * coords[i].lat;
  }
  return (Math.abs(area) / 2) * 10000;
}


export default function StatsRow({ fields = [], unitPreference = 'metric' }) {
  
  // 1. Calculăm Aria Totală dinamic
  const totalAreaHa = fields.reduce((acc, f) => {
  const serverArea = parseFloat(f.area);
  if (!isNaN(serverArea) && serverArea > 0) return acc + serverArea;
  // ✅ geometry e array direct, nu geometry.polygon
  const points = Array.isArray(f.geometry) ? f.geometry : (f.geometry?.polygon || f.polygon || []);
  return acc + calculateHectares(points);
}, 0);

  // 2. Logica de conversie Unități
  const isImperial = unitPreference === 'imperial';
  const displayArea = isImperial 
    ? (totalAreaHa * 2.47105).toFixed(2) + " ac" 
    : totalAreaHa.toFixed(2) + " ha";

  const subTextFields = `${fields.length} active ${fields.length === 1 ? 'field' : 'fields'}`;

  // 3. Simulăm restul de date bazat pe câmpurile reale (sau poți păstra SUMMARY_STATS pentru demo)
  // Într-o aplicație reală, acești parametri ar veni tot din calcule pe 'fields'
  const healthyCount = fields.filter(f => f.status === 'healthy').length;
  const healthyPercent = fields.length > 0 ? Math.round((healthyCount / fields.length) * 100) : 0;

console.log('FIELDS IN STATSROW:', fields)
console.log('FIRST FIELD:', fields[0])
console.log('FIRST FIELD AREA:', fields[0]?.area)
console.log('FIRST FIELD POLYGON:', fields[0]?.geometry?.polygon || fields[0]?.polygon)


  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <StatCard
        value={displayArea}
        label="Total Area"
        sub={subTextFields}
        icon="🗺️"
        delay={0.1}
      />
      <StatCard
        value={`${healthyPercent}%`}
        label="Health Score"
        sub="Based on NDVI"
        accent="#52B788"
        icon="✅"
        delay={0.15}
      />
      <StatCard
        value="12%" 
        label="Flood Risk"
        sub="Next 48h forecast"
        accent="#64B5F6"
        icon="🌊"
        delay={0.2}
      />
      <StatCard
        value="0.4%"
        label="Drought Risk"
        sub="Soil moisture stable"
        accent="#FCD34D"
        icon="🌵"
        delay={0.25}
      />
      <StatCard
        value={isImperial ? "4.2 t/ac" : "10.4 t/ha"}
        label="Avg. Yield"
        sub="+2.1% vs 2024"
        accent="#86EFAC"
        icon="💹"
        delay={0.3}
      />
      <StatCard
        value="847"
        label="Sensors"
        sub="99.2% uptime"
        icon="📡"
        delay={0.35}
      />
    </div>
  )
} 