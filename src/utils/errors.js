export function createErrorResponse(code, message, description, status = 400) {
  const error = { code, message, description };
  if (status >= 500) {
    error.info = 'Server error encountered. Check logs for details.';
  }
  return { error, status };
}

export function notFoundHandler(req, res) {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      description: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
}

export function errorHandler(err, req, res, next) {
  if (err && typeof err === 'object' && err.error && err.status) {
    return res.status(err.status).json({ error: err.error });
  }

  console.error(err);
  return res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
      description: 'Please try again later or contact support.',
    },
  });
}
