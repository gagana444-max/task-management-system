import { useDraggable } from '@dnd-kit/core'

export default function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: task,
  })

  const priorityColor = {
    high: 'border-l-4 border-l-red-500',
    medium: 'border-l-4 border-l-yellow-500',
    low: 'border-l-4 border-l-green-500',
  }

  const statusBadgeColor = {
    'to-do': 'bg-gray-100 text-gray-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    'done': 'bg-green-100 text-green-700',
  }

  const priorityBadgeColor = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-green-100 text-green-700',
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 scale-95 rotate-2' : 'cursor-move'
      } ${priorityColor[task.priority] || 'border-l-4 border-l-gray-300'}`}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-2">
          {task.title}
        </h4>
        <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${statusBadgeColor[task.status] || 'bg-gray-100 text-gray-700'}`}>
          {task.status}
        </span>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex justify-between items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded ${priorityBadgeColor[task.priority] || 'bg-gray-100 text-gray-700'}`}>
          {task.priority || 'N/A'}
        </span>
        {task.due_date && (
          <span className="text-xs text-gray-500">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {task.assigned_to && (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            {task.assigned_to?.charAt(0).toUpperCase()}
          </div>
          <span className="text-gray-600">{task.assigned_to}</span>
        </div>
      )}
    </div>
  )
}
