const { pool } = require('../db/pool');

// PUBLIC_INTERFACE
async function loadUserRoles(req, res, next) {
  /** Loads roles for req.user.id and attaches req.userRoles = ['admin', 'user', ...]. */
  try {
    const userId = req.user?.id;
    if (!userId) {
      req.userRoles = [];
      return next();
    }

    const rolesRes = await pool.query(
      `SELECT r.name
       FROM roles r
       INNER JOIN user_roles ur ON ur.role_id = r.id
       WHERE ur.user_id = $1
       ORDER BY r.name ASC`,
      [userId]
    );

    req.userRoles = rolesRes.rows.map((r) => r.name);
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('loadUserRoles error:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to load user roles.',
    });
  }
}

module.exports = {
  loadUserRoles,
};

