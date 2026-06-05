import jwt from 'jsonwebtoken';
import { createErrorResponse } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable in middleware.');
}

export function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json(createErrorResponse('UNAUTHORIZED', 'Authentication required', 'Authorization header missing or invalid.'));
  }

  const token = authorization.replace('Bearer ', '').trim();
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json(createErrorResponse('INVALID_TOKEN', 'Token verification failed', 'The provided token is invalid or expired.'));  
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json(createErrorResponse('FORBIDDEN', 'Insufficient permissions', 'Your account does not have access to this resource.'));
    }

    return next();
  };
}
