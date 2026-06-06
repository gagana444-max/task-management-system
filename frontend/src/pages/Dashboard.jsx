import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const roleColor = {
    Admin: 'bg-red-100 text-red-700 border-red-200',
    ProjectManager: 'bg-blue-100 text-blue-700 border-blue-200',
    Collaborator: 'bg-green-100 text-green-700 border-green-200',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border font-medium ${roleColor[user?.role]}`}>
            {user?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Tasks assigned', value: '—', icon: '✓', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'In progress', value: '—', icon: '⟳', color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Completed', value: '—', icon: '★', color: 'bg-green-50 text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center">
        <p className="text-indigo-700 font-medium text-sm">Task board coming in Phase 2</p>
        <p className="text-indigo-500 text-xs mt-1">Kanban board, task views and filtering will be built next phase.</p>
      </div>
    </div>
  )
}