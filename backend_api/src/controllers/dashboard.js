const { pool } = require('../db/pool');

class DashboardController {
  // PUBLIC_INTERFACE
  async admin(req, res) {
    /** Admin dashboard: returns counts of users and roles. Requires admin role. */
    try {
      const usersCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM users');
      const rolesCountRes = await pool.query('SELECT COUNT(*)::int AS count FROM roles');

      return res.status(200).json({
        status: 'success',
        dashboard: {
          type: 'admin',
          usersCount: usersCountRes.rows[0].count,
          rolesCount: rolesCountRes.rows[0].count,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('admin dashboard error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to load admin dashboard.',
      });
    }
  }

  // PUBLIC_INTERFACE
  async user(req, res) {
    /** User dashboard: returns a simple profile summary. Requires user role. */
    try {
      const userId = req.user?.id;

      const userRes = await pool.query(
        'SELECT id, email, created_at FROM users WHERE id = $1',
        [userId]
      );
      if (userRes.rowCount === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.',
        });
      }

      return res.status(200).json({
        status: 'success',
        dashboard: {
          type: 'user',
          profile: {
            id: userRes.rows[0].id,
            email: userRes.rows[0].email,
            createdAt: userRes.rows[0].created_at,
            roles: req.userRoles || [],
          },
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('user dashboard error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to load user dashboard.',
      });
    }
  }
}

module.exports = new DashboardController();

