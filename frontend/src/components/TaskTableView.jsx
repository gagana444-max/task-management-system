export default function TaskTableView({ tasks, onStatusChange }) {
  const statusColor = {
    'to-do': 'text-[var(--text)]',
    'in-progress': 'text-blue-700',
    'done': 'text-green-700',
  }

  const priorityColor = {
    high: 'text-red-700',
    medium: 'text-yellow-700',
    low: 'text-green-700',
  }

  const handleStatusClick = (task, newStatus) => {
    onStatusChange(task.id, newStatus)
  }

  return (
    <div className="bg-[var(--bg-card)] text-[var(--text)] rounded-lg border border-[var(--border)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--bg-input)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text)] uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text)] uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text)] uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text)] uppercase">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text)] uppercase">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-[var(--text)] uppercase">
                Assigned To
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task.id} className="hover:bg-[var(--bg-input)] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-[var(--text)]">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)] max-w-xs truncate">
                    {task.description || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-1">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusClick(task, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${statusColor[task.status] || 'text-[var(--text)]'}`}
                      >
                        <option value="to-do">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-medium ${priorityColor[task.priority] || 'text-[var(--text)]'}`}>
                    {task.priority || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      {task.assigned_to && (
                        <>
                          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {task.assigned_to?.charAt(0).toUpperCase()}
                          </div>
                          <span>{task.assigned_to}</span>
                        </>
                      )}
                      {!task.assigned_to && <span className="text-gray-400">—</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
