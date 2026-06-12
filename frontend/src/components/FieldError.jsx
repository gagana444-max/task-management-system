// frontend/src/components/FieldError.jsx
const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-red-500 text-sm mt-1">{message}</p>
  );
};

export default FieldError;