// frontend/src/components/TaskForm.jsx
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FieldError from './FieldError';
import GlobalAlert from './GlobalAlert';
import SearchableDropdown from './SearchableDropdown';
import api from '../api/axios';

const emptyForm = {
  title: '',
  description: '',
  priority: 'Medium',
  dueDate: null,
  assignedUserId: '',
};

const TaskForm = ({ task, onSuccess, onCancel }) => {
  const [form, setForm] = useState(task || emptyForm);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => setUsers([]));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const userOptions = [
    { value: '', label: '— Unassigned —' },
    ...users.map(u => ({ value: u.id, label: `${u.name} (${u.role})` }))
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (form.dueDate && new Date(form.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    if (!['Low', 'Medium', 'High'].includes(form.priority)) {
      newErrors.priority = 'Priority must be Low, Medium, or High';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueDate: form.dueDate,
        assignedUserId: form.assignedUserId || null,
        status: form.status || 'To Do',
      };

      if (task?.id) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }

      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setGlobalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-xl w-full">
      <h2 className="text-xl font-semibold mb-4">
        {task?.id ? 'Edit Task' : 'Create New Task'}
      </h2>

      <GlobalAlert
        type="error"
        message={globalError}
        onClose={() => setGlobalError('')}
      />

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter task title"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          <FieldError message={errors.title} />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Describe the task..."
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.priority ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <FieldError message={errors.priority} />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <DatePicker
            selected={form.dueDate ? new Date(form.dueDate) : null}
            onChange={(date) => {
              setForm(prev => ({ ...prev, dueDate: date }));
              setErrors(prev => ({ ...prev, dueDate: '' }));
            }}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select a due date"
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          <FieldError message={errors.dueDate} />
        </div>

        {/* Assign User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assign To
          </label>
          <SearchableDropdown
            options={userOptions}
            value={form.assignedUserId}
            onChange={(val) => setForm(prev => ({ ...prev, assignedUserId: val }))}
            placeholder="Select a user"
            className="w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : task?.id ? 'Update Task' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 px-5 py-2 rounded text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default TaskForm;