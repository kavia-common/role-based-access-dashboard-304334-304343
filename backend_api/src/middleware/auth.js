const { verifyAccessToken } = require('../services/jwt');

/**
 * Extracts bearer token from Authorization header.
 * @param {import('express').Request} req
 */
function getBearerToken(req) {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token.trim();
}

// PUBLIC_INTERFACE
function requireAuth(req, res, next) {
  /** Express middleware that requires a valid JWT bearer token. Attaches req.user. */
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Missing Authorization header. Use: Authorization: Bearer <token>.',
      });
    }

    const decoded = verifyAccessToken(token);

    // We standardize on: { sub: userId, email }
    if (!decoded || !decoded.sub) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token payload.',
      });
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token.',
    });
  }
}

module.exports = {
  requireAuth,
};

