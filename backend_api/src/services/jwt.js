const jwt = require('jsonwebtoken');

function getJwtSecret() {
  // Prefer env secret. Provide a dev fallback so local runs can work,
  // but encourage explicit configuration.
  return process.env.JWT_SECRET || 'dev_only_change_me';
}

// PUBLIC_INTERFACE
function signAccessToken(payload, options = {}) {
  /** Signs and returns a JWT access token for the given payload. */
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: '2h', ...options });
}

// PUBLIC_INTERFACE
function verifyAccessToken(token) {
  /** Verifies a JWT access token and returns the decoded payload. Throws on invalid tokens. */
  const secret = getJwtSecret();
  return jwt.verify(token, secret);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
};

