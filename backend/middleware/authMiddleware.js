const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Feature 9: Role-Based Authorization & Authentication
 * Verifies JWT token, extracts user, and enforces authentication
 */
async function verifyToken(req, res, next) {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'university_warranty_mgmt_jwt_secret_key_2026');

    // Fetch user from database to ensure user still exists
    const userRes = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.',
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
}

/**
 * Enforces Admin role for restricted administrative endpoints
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges required.',
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
