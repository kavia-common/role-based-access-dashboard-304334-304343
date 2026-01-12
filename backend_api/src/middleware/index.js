const { requireAuth } = require('./auth');
const { requireRole } = require('./rbac');
const { loadUserRoles } = require('./loadUserRoles');

module.exports = {
  requireAuth,
  requireRole,
  loadUserRoles,
};

