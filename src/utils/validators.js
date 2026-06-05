const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Request body must be a JSON object.');
    return { valid: false, errors };
  }

  const name = String(data.name ?? '').trim();
  const email = String(data.email ?? '').trim();
  const password = String(data.password ?? '');

  if (name.length < 2) {
    errors.push('Name must be at least 2 characters.');
  }

  if (!emailRegex.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  return { valid: errors.length === 0, errors };
}

export function validateLoginInput(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Request body must be a JSON object.');
    return { valid: false, errors };
  }

  const email = String(data.email ?? '').trim();
  const password = String(data.password ?? '');

  if (!emailRegex.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password) {
    errors.push('Password is required.');
  }

  return { valid: errors.length === 0, errors };
}
