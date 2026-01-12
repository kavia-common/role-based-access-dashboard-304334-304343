// PUBLIC_INTERFACE
function requireRole(allowedRoles) {
  /** Express middleware factory that requires the authenticated user to have at least one allowed role. */
  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [];

  return (req, res, next) => {
    const roles = req.userRoles || [];
    const hasRole = roles.some((r) => allowed.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden. Required role(s): ${allowed.join(', ') || '(none)'}.`,
      });
    }

    return next();
  };
}

module.exports = {
  requireRole,
};

