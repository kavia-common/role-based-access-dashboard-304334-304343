const express = require('express');
const dashboardController = require('../controllers/dashboard');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { loadUserRoles } = require('../middleware/loadUserRoles');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Role-based dashboards
 */

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     tags: [Dashboard]
 *     summary: Admin dashboard
 *     description: Requires admin role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/admin',
  requireAuth,
  loadUserRoles,
  requireRole(['admin']),
  dashboardController.admin.bind(dashboardController)
);

/**
 * @swagger
 * /api/dashboard/user:
 *   get:
 *     tags: [Dashboard]
 *     summary: User dashboard
 *     description: Requires user role.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard payload
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/user',
  requireAuth,
  loadUserRoles,
  requireRole(['user']),
  dashboardController.user.bind(dashboardController)
);

module.exports = router;

