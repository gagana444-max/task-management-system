import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db.js';
import { createErrorResponse } from '../utils/errors.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable.');
}

export async function registerUser({ name, email, password, role }) {
  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
  if (existing.length > 0) {
    throw createErrorResponse('USER_EXISTS', 'Email address already registered', 'Use a different email or log in with existing credentials.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await query(
    'INSERT INTO users (name, email, password, role, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, 1, NOW(), NOW())',
    [name.trim(), email.toLowerCase().trim(), hashedPassword, role],
  );

  const insertId = result.insertId ?? null;
  return {
    id: insertId,
    name,
    email: email.toLowerCase().trim(),
    role,
    message: 'Registration successful. Log in to receive your access token.',
  };
}

export async function loginUser({ email, password }) {
  const users = await query('SELECT id, name, email, password, role, is_active FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
  const user = users?.[0];

  if (!user) {
    throw createErrorResponse('INVALID_CREDENTIALS', 'Email or password is incorrect', 'Verify your credentials and try again.', 401);
  }

  if (!user.is_active) {
    throw createErrorResponse('ACCOUNT_INACTIVE', 'Account is deactivated', 'Contact an administrator to reactivate your account.', 403);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw createErrorResponse('INVALID_CREDENTIALS', 'Email or password is incorrect', 'Verify your credentials and try again.', 401);
  }

  const tokenPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: JWT_EXPIRES_IN,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function getUserById(userId) {
  const users = await query(
    'SELECT id, name, email, role, is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  return users?.[0] ?? null;
}
