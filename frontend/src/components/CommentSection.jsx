// frontend/src/components/CommentSection.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import GlobalAlert from './GlobalAlert';

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    setFetching(true);
    api.get(`/tasks/${taskId}/comments`)
      .then(res => setComments(res.data))
      .catch(() => setError('Could not load comments'))
      .finally(() => setFetching(false));
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, {
        content: newComment.trim(),
      });
      setComments(prev => [res.data, ...prev]);
      setNewComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Comments</h3>

      <GlobalAlert type="error" message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          rows={2}
          placeholder="Write a comment..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !newComment.trim()}
          className="mt-2 bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {fetching ? (
        <p className="text-gray-400 text-sm">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-[var(--bg-input)] rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-[var(--text)]">
                  {comment.user?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-[var(--text)]">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;