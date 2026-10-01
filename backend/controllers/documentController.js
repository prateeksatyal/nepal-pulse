const fs = require('fs');
const path = require('path');
const documentModel = require('../models/documentModel');
const productModel = require('../models/productModel');
const warrantyModel = require('../models/warrantyModel');

// POST /api/documents/receipts/:productId
async function uploadReceipt(req, res, next) {
  try {
    const { productId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt file provided or file format rejected.',
      });
    }

    // Verify product ownership
    const product = await productModel.getById(productId, req.user.id, req.user.role);
    if (!product) {
      // Clean up uploaded file if product not found
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Associated product not found or access denied.',
      });
    }

    const receipt = await documentModel.createReceipt({
      product_id: parseInt(productId, 10),
      file_name: req.file.originalname,
      file_path: req.file.filename,
      file_type: req.file.mimetype,
      file_size: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: 'Receipt uploaded successfully.',
      data: receipt,
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
}

// GET /api/documents/receipts/:id/download
async function downloadReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await documentModel.getReceiptById(id);

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    // Ownership check
    if (req.user.role !== 'admin' && receipt.product_owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'receipts', receipt.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.setHeader('Content-Type', receipt.file_type);
    res.setHeader('Content-Disposition', `inline; filename="${receipt.file_name}"`);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/documents/receipts/:id
async function deleteReceipt(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await documentModel.getReceiptById(id);

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    if (req.user.role !== 'admin' && receipt.product_owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'receipts', receipt.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete receipt file from disk:', err.message);
      }
    }

    await documentModel.deleteReceipt(id);

    return res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/documents/warranties/:warrantyId
async function uploadWarrantyDoc(req, res, next) {
  try {
    const { warrantyId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided or file format rejected.',
      });
    }

    // Verify warranty ownership
    const warranty = await warrantyModel.getById(warrantyId, req.user.id, req.user.role);
    if (!warranty) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Associated warranty not found or access denied.',
      });
    }

    const doc = await documentModel.createWarrantyDoc({
      warranty_id: parseInt(warrantyId, 10),
      file_name: req.file.originalname,
      file_path: req.file.filename,
      file_type: req.file.mimetype,
      file_size: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: 'Warranty document uploaded successfully.',
      data: doc,
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
}

// GET /api/documents/warranties/:id/download
async function downloadWarrantyDoc(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await documentModel.getWarrantyDocById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Warranty document not found.' });
    }

    if (req.user.role !== 'admin' && doc.product_owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'warranties', doc.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server.' });
    }

    res.setHeader('Content-Type', doc.file_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    return res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}

// DELETE /api/documents/warranties/:id
async function deleteWarrantyDoc(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await documentModel.getWarrantyDocById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (req.user.role !== 'admin' && doc.product_owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', 'warranties', doc.file_path);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete warranty doc file from disk:', err.message);
      }
    }

    await documentModel.deleteWarrantyDoc(id);

    return res.status(200).json({
      success: true,
      message: 'Warranty document deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/documents
async function getAllDocuments(req, res, next) {
  try {
    const documents = await documentModel.getAllDocuments({
      userId: req.user.id,
      role: req.user.role,
    });

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadReceipt,
  downloadReceipt,
  deleteReceipt,
  uploadWarrantyDoc,
  downloadWarrantyDoc,
  deleteWarrantyDoc,
  getAllDocuments,
};
