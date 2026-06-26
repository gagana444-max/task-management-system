// frontend/src/components/AttachmentUpload.jsx
import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import GlobalAlert from './GlobalAlert';

const AttachmentUpload = ({ taskId }) => {
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!taskId) return;
    api.get(`/tasks/${taskId}/attachments`)
      .then(res => setAttachments(res.data))
      .catch(() => {});
  }, [taskId]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post(`/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAttachments(prev => [...prev, res.data]);
      setPreview(null);
      fileInputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-3">Attachments</h3>

      <GlobalAlert type="error" message={error} onClose={() => setError('')} />

      <div className="mb-4">
        <label className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded">
          {uploading ? 'Uploading...' : 'Choose File to Upload'}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">Supported: images, PDF, Word, Excel (max 5MB)</p>
      </div>

      {preview && (
        <div className="mb-4">
          <img src={preview} alt="Preview" className="max-h-40 rounded border border-gray-200" />
        </div>
      )}

      {attachments.length === 0 ? (
        <p className="text-gray-400 text-sm">No attachments yet.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map(att => (
            <div key={att.id} className="flex items-center justify-between bg-gray-50 rounded p-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📎</span>
                <span className="text-gray-800">{att.filename}</span>
                <span className="text-gray-400 text-xs">({formatSize(att.size)})</span>
              </div>
              <a
                href={`${import.meta.env.VITE_API_URL || '/api'}/tasks/${taskId}/attachments/${att.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;