export default function SortBar({ onSortChange }) {
  const handleSortChange = (e) => {
    onSortChange(e.target.value)
  }

  return (
    <div className="bg-[var(--bg-card)] text-[var(--text)] rounded-lg border border-[var(--border)] p-4 mb-4">
      <label className="block text-sm font-medium text-[var(--text)] mb-2">
        Sort By
      </label>
      <select
        onChange={handleSortChange}
        defaultValue="created_at"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="created_at">Creation Date (Newest)</option>
        <option value="created_at_asc">Creation Date (Oldest)</option>
        <option value="due_date">Due Date (Soonest)</option>
        <option value="due_date_latest">Due Date (Latest)</option>
        <option value="priority_high">Priority (High First)</option>
        <option value="priority_low">Priority (Low First)</option>
      </select>
    </div>
  )
}
