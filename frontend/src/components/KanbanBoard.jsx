import { useState, useEffect } from 'react'
import { DndContext, closestCorners } from '@dnd-kit/core'
import KanbanColumn from './KanbanColumn'
import ViewToggle from './ViewToggle'
import FilterBar from './FilterBar'
import SortBar from './SortBar'
import TaskTableView from './TaskTableView'
import api from '../api/axios'

// 🚀 MOCK DATA FOR TESTING - Remove this for production
// Set USE_MOCK_DATA to false to use real API
const USE_MOCK_DATA = false

const MOCK_TASKS = [
  {
    id: 1,
    title: 'Design Login Page',
    description: 'Create wireframes and UI mockups for login screen',
    status: 'done',
    priority: 'high',
    assigned_to: 'John',
    due_date: '2026-06-05',
    created_at: '2026-05-20',
  },
  {
    id: 2,
    title: 'Implement Kanban Board',
    description: 'Build drag-and-drop Kanban board with React and dnd-kit',
    status: 'in-progress',
    priority: 'high',
    assigned_to: 'Sarah',
    due_date: '2026-06-12',
    created_at: '2026-06-01',
  },
  {
    id: 3,
    title: 'Fix Login Bug',
    description: 'Resolve token expiration issue in auth flow',
    status: 'to-do',
    priority: 'high',
    assigned_to: 'Mike',
    due_date: '2026-06-08',
    created_at: '2026-06-02',
  },
  {
    id: 4,
    title: 'Database Schema Design',
    description: 'Design normalized database schema for task management',
    status: 'done',
    priority: 'medium',
    assigned_to: 'Alex',
    due_date: '2026-06-01',
    created_at: '2026-05-15',
  },
  {
    id: 5,
    title: 'Add Notifications API',
    description: 'Create REST endpoints for task notifications',
    status: 'in-progress',
    priority: 'medium',
    assigned_to: 'Sarah',
    due_date: '2026-06-15',
    created_at: '2026-06-03',
  },
  {
    id: 6,
    title: 'Write Unit Tests',
    description: 'Add comprehensive unit tests for dashboard components',
    status: 'to-do',
    priority: 'low',
    assigned_to: 'John',
    due_date: '2026-06-20',
    created_at: '2026-06-05',
  },
  {
    id: 7,
    title: 'Deploy to Staging',
    description: 'Set up CI/CD pipeline and deploy to staging environment',
    status: 'to-do',
    priority: 'high',
    assigned_to: 'Mike',
    due_date: '2026-06-18',
    created_at: '2026-06-04',
  },
]

const MOCK_USERS = [
  { id: 1, name: 'John' },
  { id: 2, name: 'Sarah' },
  { id: 3, name: 'Mike' },
  { id: 4, name: 'Alex' },
]

export default function KanbanBoard() {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentView, setCurrentView] = useState('board')
  const [filters, setFilters] = useState({})
  const [sortBy, setSortBy] = useState('created_at')
  const [users, setUsers] = useState([])

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])

  // Apply filters and sorting whenever tasks, filters, or sort change
  useEffect(() => {
    applyFiltersAndSort()
  }, [tasks, filters, sortBy])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      
      // 🚀 Use mock data if enabled (for testing without backend)
      if (USE_MOCK_DATA) {
        setTasks(MOCK_TASKS)
        setError(null)
        setLoading(false)
        return
      }
      
      const response = await api.get('/tasks')
      setTasks(response.data || [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      // 🚀 Use mock users if enabled
      if (USE_MOCK_DATA) {
        setUsers(MOCK_USERS)
        return
      }
      
      const response = await api.get('/users')
      setUsers(response.data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const applyFiltersAndSort = () => {
    let filtered = tasks

    // Apply filters
    if (filters.priority) {
      filtered = filtered.filter(t => t.priority === filters.priority)
    }
    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status)
    }
    if (filters.assigned_to) {
      filtered = filtered.filter(t => t.assigned_to === filters.assigned_to)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'created_at_asc':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'due_date':
          return new Date(a.due_date || Date.now()) - new Date(b.due_date || Date.now())
        case 'due_date_latest':
          return new Date(b.due_date || 0) - new Date(a.due_date || 0)
        case 'priority_high':
          return priorityValue(b.priority) - priorityValue(a.priority)
        case 'priority_low':
          return priorityValue(a.priority) - priorityValue(b.priority)
        default:
          return 0
      }
    })

    setFilteredTasks(sorted)
  }

  const priorityValue = (priority) => {
    const values = { high: 3, medium: 2, low: 1 }
    return values[priority] || 0
  }

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
  }

  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (!over) return

    const taskId = active.id
    const newStatus = over.id

    // Optimistically update UI
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    // Update on backend
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus })
    } catch (err) {
      console.error('Error updating task status:', err)
      // Revert on error
      fetchTasks()
      setError('Failed to update task status')
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistically update UI
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    )

    // Update on backend
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus })
    } catch (err) {
      console.error('Error updating task status:', err)
      fetchTasks()
      setError('Failed to update task status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  const todoTasks = filteredTasks.filter(t => t.status === 'to-do')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <ViewToggle currentView={currentView} onViewChange={handleViewChange} />
      </div>

      <FilterBar onFilterChange={handleFilterChange} assignedUsers={users} />
      <SortBar onSortChange={handleSortChange} />

      {currentView === 'board' ? (
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <KanbanColumn
              columnId="to-do"
              columnTitle="To Do"
              tasks={todoTasks}
            />

            <KanbanColumn
              columnId="in-progress"
              columnTitle="In Progress"
              tasks={inProgressTasks}
            />

            <KanbanColumn
              columnId="done"
              columnTitle="Done"
              tasks={doneTasks}
            />
          </div>
        </DndContext>
      ) : (
        <TaskTableView tasks={filteredTasks} onStatusChange={handleStatusChange} />
      )}
    </div>
  )
}
