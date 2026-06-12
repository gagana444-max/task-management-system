// frontend/src/pages/TasksList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskForm from '../components/TaskForm';
import GlobalAlert from '../components/GlobalAlert';

const priorityColors = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const TasksList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(() => setError('Could not load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      <GlobalAlert type="error" message={error} onClose={() => setError('')} />

      {showForm && (
        <div className="mb-6">
          <TaskForm
            onSuccess={() => { setShowForm(false); fetchTasks(); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-400">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-400">No tasks yet. Create your first one!</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-500">
                  {task.assignedUser?.name || 'Unassigned'} ·{' '}
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksList;