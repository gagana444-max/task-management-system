export default function ViewToggle({ currentView, onViewChange }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-2">
      <button
        onClick={() => onViewChange('board')}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          currentView === 'board'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        📊 Board View
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          currentView === 'table'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        📋 Table View
      </button>
    </div>
  )
}
