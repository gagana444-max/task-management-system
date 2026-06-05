import express from 'express';
import { loginUser, registerUser, getUserById } from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';
import { validateLoginInput, validateRegisterInput } from '../utils/validators.js';
import { createErrorResponse } from '../utils/errors.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const validation = validateRegisterInput(req.body);
    if (!validation.valid) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid registration data', validation.errors.join(' | ')));
    }

    const { name, email, password, role } = req.body;
    if (role && role !== 'Collaborator') {
      return res.status(403).json(createErrorResponse('FORBIDDEN', 'Role assignment denied', 'Only Collaborator users may self-register; role assignment is managed by Admins.'));
    }

    const result = await registerUser({ name, email, password, role: 'Collaborator' });
    return res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const validation = validateLoginInput(req.body);
    if (!validation.valid) {
      return res.status(400).json(createErrorResponse('VALIDATION_ERROR', 'Invalid login request', validation.errors.join(' | ')));
    }

    const { email, password } = req.body;
    const tokenData = await loginUser({ email, password });
    return res.status(200).json({ data: tokenData });
  } catch (error) {
    next(error);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json(createErrorResponse('NOT_FOUND', 'User not found', 'Authenticated user record could not be loaded.'));
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
