export default function PageHeader({ title, subtitle, statText, statColor = '#ea2261' }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16, boxShadow: '0 4px 16px rgba(13,37,61,0.10)' }}>
      <div style={{
        background: 'linear-gradient(100deg, #2e2b8c 0%, #533afd 45%, #a855c4 75%, #ea2261 100%)',
        padding: '18px 20px'
      }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, fontSize: 22, color: '#fff', letterSpacing: '-0.3px' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: '#e8e4fd', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {statText && (
        <div style={{ background: 'var(--bg-card)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: statColor, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--text)' }}>{statText}</span>
        </div>
      )}
    </div>
  )
}