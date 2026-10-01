const db = require('../config/db');
const userModel = require('../models/userModel');
const { calculateWarrantyStatus, enrichWarrantyRecord } = require('../services/warrantyService');

// GET /api/admin/stats
// Admin Dashboard metrics
async function getAdminStats(req, res, next) {
  try {
    const [usersRes, productsRes, warrantiesRes, servicesRes, receiptsRes, docsRes, categoriesRes] =
      await Promise.all([
        db.query('SELECT COUNT(*) AS count FROM users'),
        db.query('SELECT COUNT(*) AS count FROM products'),
        db.query('SELECT w.*, p.name AS product_name FROM warranties w JOIN products p ON p.id = w.product_id'),
        db.query('SELECT COUNT(*) AS count FROM service_records'),
        db.query('SELECT COUNT(*) AS count FROM receipts'),
        db.query('SELECT COUNT(*) AS count FROM warranty_documents'),
        db.query(`
          SELECT c.id, c.name, COALESCE(p_counts.product_count, 0) AS product_count
          FROM categories c
          LEFT JOIN (
            SELECT category_id, COUNT(id) AS product_count
            FROM products
            GROUP BY category_id
          ) p_counts ON p_counts.category_id = c.id
          ORDER BY product_count DESC
        `),
      ]);

    const enrichedWarranties = warrantiesRes.rows.map(enrichWarrantyRecord);

    const activeCount = enrichedWarranties.filter((w) => w.is_active).length;
    const expiringSoonCount = enrichedWarranties.filter((w) => w.is_expiring_soon).length;
    const expiredCount = enrichedWarranties.filter((w) => w.is_expired).length;

    const totalDocuments =
      parseInt(receiptsRes.rows[0].count, 10) + parseInt(docsRes.rows[0].count, 10);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: parseInt(usersRes.rows[0].count, 10),
        totalProducts: parseInt(productsRes.rows[0].count, 10),
        totalWarranties: enrichedWarranties.length,
        activeWarranties: activeCount,
        expiringSoonWarranties: expiringSoonCount,
        expiredWarranties: expiredCount,
        totalServices: parseInt(servicesRes.rows[0].count, 10),
        totalDocuments,
        categories: categoriesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/dashboard/stats
// Normal User Dashboard metrics
async function getUserDashboardStats(req, res, next) {
  try {
    const userId = req.user.id;

    const [productsRes, warrantiesRes, recentServicesRes] = await Promise.all([
      db.query('SELECT COUNT(*) AS count FROM products WHERE user_id = $1', [userId]),
      db.query(
        `SELECT w.*, p.name AS product_name, p.brand AS product_brand
         FROM warranties w
         JOIN products p ON p.id = w.product_id
         WHERE p.user_id = $1
         ORDER BY w.end_date ASC`,
        [userId]
      ),
      db.query(
        `SELECT sr.*, p.name AS product_name
         FROM service_records sr
         JOIN products p ON p.id = sr.product_id
         WHERE p.user_id = $1
         ORDER BY sr.service_date DESC
         LIMIT 5`,
        [userId]
      ),
    ]);

    const enrichedWarranties = warrantiesRes.rows.map(enrichWarrantyRecord);

    const activeCount = enrichedWarranties.filter((w) => w.is_active).length;
    const expiringSoonCount = enrichedWarranties.filter((w) => w.is_expiring_soon).length;
    const expiredCount = enrichedWarranties.filter((w) => w.is_expired).length;

    // Up to 5 upcoming expiries for immediate user action
    const upcomingExpiries = enrichedWarranties
      .filter((w) => !w.is_expired)
      .slice(0, 5);

    // Expiring soon section items
    const expiringSoonList = enrichedWarranties.filter((w) => w.is_expiring_soon);

    return res.status(200).json({
      success: true,
      stats: {
        totalProducts: parseInt(productsRes.rows[0].count, 10),
        totalWarranties: enrichedWarranties.length,
        activeWarranties: activeCount,
        expiringSoonWarranties: expiringSoonCount,
        expiredWarranties: expiredCount,
        upcomingExpiries,
        expiringSoonList,
        recentServices: recentServicesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/users
async function getUsers(req, res, next) {
  try {
    const users = await userModel.getAllUsers();
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/users/:id/role
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role, name } = req.body;

    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin".',
      });
    }

    if (parseInt(id, 10) === req.user.id && role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote yourself from administrator.',
      });
    }

    const updated = await userModel.updateUser(id, { role, name });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    const deleted = await userModel.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAdminStats,
  getUserDashboardStats,
  getUsers,
  updateUserRole,
  deleteUser,
};
