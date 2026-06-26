import { useDroppable } from '@dnd-kit/core'
import TaskCard from './TaskCard'

export default function KanbanColumn({ columnId, columnTitle, tasks }) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId })

  return (
    <div className="flex-1 bg-[var(--bg-input)] rounded-lg p-4 min-h-96">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--text)] flex items-center gap-2">
          {columnTitle}
          <span className="bg-gray-200 text-[var(--text)] text-xs font-bold px-2.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </h2>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-32 rounded-lg transition-colors ${
          isOver ? 'bg-blue-50' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No tasks in this column
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}
