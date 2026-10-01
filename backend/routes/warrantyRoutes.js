const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', warrantyController.getWarranties);
router.get('/:id', warrantyController.getWarrantyById);
router.post('/', warrantyController.createWarranty);
router.put('/:id', warrantyController.updateWarranty);
router.delete('/:id', warrantyController.deleteWarranty);

// Feature 10: Email reminder trigger
router.post('/:id/send-reminder', warrantyController.sendReminder);

module.exports = router;
