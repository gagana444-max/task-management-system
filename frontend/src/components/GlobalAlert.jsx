// frontend/src/components/GlobalAlert.jsx
const GlobalAlert = ({ type, message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-red-50 border-red-400 text-red-700',
    success: 'bg-green-50 border-green-400 text-green-700',
  };

  return (
    <div className={`border rounded p-4 mb-4 flex justify-between items-start ${styles[type] || styles.error}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold text-lg leading-none">
          &times;
        </button>
      )}
    </div>
  );
};

export default GlobalAlert;