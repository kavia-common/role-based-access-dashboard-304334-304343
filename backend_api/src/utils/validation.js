const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// PUBLIC_INTERFACE
function validateEmail(email) {
  /** Validates email format. Returns null if OK otherwise error message string. */
  if (typeof email !== 'string' || !email.trim()) return 'Email is required.';
  if (!EMAIL_REGEX.test(email.trim().toLowerCase())) return 'Email format is invalid.';
  return null;
}

// PUBLIC_INTERFACE
function validatePassword(password) {
  /** Validates password strength. Returns null if OK otherwise error message string. */
  if (typeof password !== 'string' || !password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

module.exports = {
  validateEmail,
  validatePassword,
};

