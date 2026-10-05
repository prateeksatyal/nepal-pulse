const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken } = require('../middleware/authMiddleware');
const { uploadReceipt, uploadWarrantyDoc } = require('../middleware/uploadMiddleware');

router.use(verifyToken);

// All documents list for user/admin
router.get('/', documentController.getAllDocuments);

// Receipt endpoints (Feature 7)
router.post('/receipts/:productId', uploadReceipt, documentController.uploadReceipt);
router.get('/receipts/:id/download', documentController.downloadReceipt);
router.get('/receipts/:id/signed-url', documentController.getReceiptSignedUrl);
router.delete('/receipts/:id', documentController.deleteReceipt);

// Warranty document endpoints (Feature 8)
router.post('/warranties/:warrantyId', uploadWarrantyDoc, documentController.uploadWarrantyDoc);
router.get('/warranties/:id/download', documentController.downloadWarrantyDoc);
router.get('/warranties/:id/signed-url', documentController.getWarrantyDocSignedUrl);
router.delete('/warranties/:id', documentController.deleteWarrantyDoc);

module.exports = router;
