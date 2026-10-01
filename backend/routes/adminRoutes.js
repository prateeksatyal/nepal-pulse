const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

// Normal User Dashboard stats (Section 8)
router.get('/dashboard/stats', verifyToken, adminController.getUserDashboardStats);

// Admin-only stats & management (Section 9)
router.get('/admin/stats', verifyToken, requireAdmin, adminController.getAdminStats);
router.get('/admin/users', verifyToken, requireAdmin, adminController.getUsers);
router.put('/admin/users/:id/role', verifyToken, requireAdmin, adminController.updateUserRole);
router.delete('/admin/users/:id', verifyToken, requireAdmin, adminController.deleteUser);

module.exports = router;
