import { LayoutGrid, List } from 'lucide-react'

export default function ViewToggle({ currentView, onViewChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #e3e8ee', borderRadius: 8, padding: 4, gap: 4 }}>
      <button
        onClick={() => onViewChange('board')}
        title="Board View"
        style={{
          width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          background: currentView === 'board' ? 'var(--primary)' : 'transparent',
          color: currentView === 'board' ? '#fff' : '#64748d'
        }}
      >
        <LayoutGrid size={16} strokeWidth={currentView === 'board' ? 2 : 1.5} />
      </button>
      <button
        onClick={() => onViewChange('table')}
        title="Table View"
        style={{
          width: 32, height: 32, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
          background: currentView === 'table' ? 'var(--primary)' : 'transparent',
          color: currentView === 'table' ? '#fff' : '#64748d'
        }}
      >
        <List size={18} strokeWidth={currentView === 'table' ? 2 : 1.5} />
      </button>
    </div>
  )
}
