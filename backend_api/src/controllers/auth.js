const bcrypt = require('bcrypt');
const { pool } = require('../db/pool');
const { signAccessToken } = require('../services/jwt');
const { validateEmail, validatePassword } = require('../utils/validation');

const SALT_ROUNDS = 12;

async function getUserWithRolesById(userId) {
  // Returns { id, email, roles: [] } or null
  const userRes = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [userId]
  );
  if (userRes.rowCount === 0) return null;

  const rolesRes = await pool.query(
    `SELECT r.name
     FROM roles r
     INNER JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = $1
     ORDER BY r.name ASC`,
    [userId]
  );

  return {
    id: userRes.rows[0].id,
    email: userRes.rows[0].email,
    roles: rolesRes.rows.map((r) => r.name),
  };
}

async function getUserByEmail(email) {
  const res = await pool.query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  return res.rowCount ? res.rows[0] : null;
}

async function ensureUserRole(userId, roleName) {
  // Create role if missing (safe for first-time setup).
  const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  let roleId = roleRes.rowCount ? roleRes.rows[0].id : null;

  if (!roleId) {
    const created = await pool.query(
      'INSERT INTO roles (name) VALUES ($1) RETURNING id',
      [roleName]
    );
    roleId = created.rows[0].id;
  }

  // Link role (ignore if already linked).
  await pool.query(
    `INSERT INTO user_roles (user_id, role_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [userId, roleId]
  );
}

class AuthController {
  // PUBLIC_INTERFACE
  async register(req, res) {
    /** Registers a new user and assigns the default 'user' role. */
    try {
      const { email, password } = req.body || {};

      const emailErr = validateEmail(email);
      const passwordErr = validatePassword(password);
      if (emailErr || passwordErr) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed.',
          errors: {
            ...(emailErr ? { email: emailErr } : {}),
            ...(passwordErr ? { password: passwordErr } : {}),
          },
        });
      }

      const existing = await getUserByEmail(email);
      if (existing) {
        return res.status(409).json({
          status: 'error',
          message: 'Email already registered.',
        });
      }

      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

      const insertRes = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email.toLowerCase(), passwordHash]
      );

      const userId = insertRes.rows[0].id;

      // Default role for new registrations.
      await ensureUserRole(userId, 'user');

      const user = await getUserWithRolesById(userId);

      return res.status(201).json({
        status: 'success',
        user,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('register error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to register user.',
      });
    }
  }

  // PUBLIC_INTERFACE
  async login(req, res) {
    /** Authenticates a user with email/password and returns a JWT token and user profile. */
    try {
      const { email, password } = req.body || {};

      const emailErr = validateEmail(email);
      if (emailErr) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed.',
          errors: { email: emailErr },
        });
      }
      if (typeof password !== 'string' || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed.',
          errors: { password: 'Password is required.' },
        });
      }

      const userRow = await getUserByEmail(email);
      if (!userRow) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password.',
        });
      }

      const ok = await bcrypt.compare(password, userRow.password_hash);
      if (!ok) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password.',
        });
      }

      const user = await getUserWithRolesById(userRow.id);

      const token = signAccessToken({
        sub: user.id,
        email: user.email,
      });

      return res.status(200).json({
        status: 'success',
        token,
        user,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('login error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to login.',
      });
    }
  }

  // PUBLIC_INTERFACE
  async logout(req, res) {
    /** Stateless JWT logout (no-op). If refresh tokens are added later, invalidate them here. */
    return res.status(200).json({
      status: 'success',
      message: 'Logged out.',
    });
  }

  // PUBLIC_INTERFACE
  async me(req, res) {
    /** Returns current user profile + roles. Requires requireAuth + user role loading middleware. */
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized.',
        });
      }

      const user = await getUserWithRolesById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found.',
        });
      }

      return res.status(200).json({
        status: 'success',
        user,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('me error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch current user.',
      });
    }
  }
}

module.exports = new AuthController();

