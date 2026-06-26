export default function FilterBar({ onFilterChange, assignedUsers = [] }) {
  const handlePriorityChange = (e) => {
    onFilterChange({ priority: e.target.value })
  }

  const handleStatusChange = (e) => {
    onFilterChange({ status: e.target.value })
  }

  const handleAssignedUserChange = (e) => {
    onFilterChange({ assigned_to: e.target.value })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Filters</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            onChange={handlePriorityChange}
            defaultValue=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            onChange={handleStatusChange}
            defaultValue=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Assigned User
          </label>
          <select
            onChange={handleAssignedUserChange}
            defaultValue=""
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Users</option>
            {assignedUsers.filter(user => user.is_active).map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
