// frontend/src/pages/TaskDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TaskForm from '../components/TaskForm';
import CommentSection from '../components/CommentSection';
import AttachmentUpload from '../components/AttachmentUpload';
import GlobalAlert from '../components/GlobalAlert';

const priorityColors = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

const statusColors = {
  'To Do': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done': 'bg-green-100 text-green-700',
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTask = () => {
    api.get(`/tasks/${id}`)
      .then(res => setTask(res.data))
      .catch(() => setError('Task not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  if (loading) return <p className="p-6 text-gray-400">Loading task...</p>;

  if (editing) {
    return (
      <div className="p-6">
        <TaskForm
          task={task}
          onSuccess={() => { setEditing(false); fetchTask(); }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-600 hover:underline mb-4 block"
      >
        ← Back
      </button>

      <GlobalAlert type="error" message={error} onClose={() => setError('')} />

      {task && (
        <>
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-semibold">{task.title}</h1>
              <button
                onClick={() => setEditing(true)}
                className="border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50"
              >
                Edit
              </button>
            </div>

            <p className="text-gray-600 mb-4">{task.description || 'No description provided.'}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
                {task.priority} Priority
              </span>
              <span className={`text-xs px-2 py-1 rounded ${statusColors[task.status]}`}>
                {task.status}
              </span>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              {task.dueDate && (
                <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
              {task.assignedUser && (
                <p>Assigned to: {task.assignedUser.name}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <AttachmentUpload taskId={task.id} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <CommentSection taskId={task.id} />
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetail;