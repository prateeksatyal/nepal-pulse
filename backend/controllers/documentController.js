const fs = require('fs');
const path = require('path');
const documentModel = require('../models/documentModel');
const productModel = require('../models/productModel');
const warrantyModel = require('../models/warrantyModel');
const supabaseService = require('../services/supabaseService');

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
      return res.status(404).json({
        success: false,
        message: 'Associated product not found or access denied.',
      });
    }

    // Generate unique file name and storage path: receipts/{authenticatedUserId}/{uniqueFileName}
    const uniqueFileName = supabaseService.sanitizeFileName(req.file.originalname, 'receipt');
    const storagePath = `${req.user.id}/${uniqueFileName}`;

    // Upload memory buffer directly to Supabase Storage private bucket
    await supabaseService.uploadFile(
      supabaseService.RECEIPTS_BUCKET,
      storagePath,
      req.file.buffer,
      req.file.mimetype
    );

    // Store metadata and storage path in PostgreSQL
    const receipt = await documentModel.createReceipt({
      product_id: parseInt(productId, 10),
      file_name: req.file.originalname,
      file_path: storagePath,
      file_type: req.file.mimetype,
      file_size: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: 'Receipt uploaded successfully.',
      data: receipt,
    });
  } catch (error) {
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

    // Optional query parameter for signed URL response or redirect
    if (req.query.format === 'url') {
      const signedUrl = await supabaseService.createSignedUrl(
        supabaseService.RECEIPTS_BUCKET,
        receipt.file_path,
        3600
      );
      return res.status(200).json({ success: true, signedUrl });
    }

    if (req.query.redirect === 'true') {
      const signedUrl = await supabaseService.createSignedUrl(
        supabaseService.RECEIPTS_BUCKET,
        receipt.file_path,
        300
      );
      return res.redirect(signedUrl);
    }

    // Stream / send buffer from Supabase Storage (with fallback to local disk for legacy files)
    let fileBuffer = null;
    try {
      fileBuffer = await supabaseService.downloadFile(
        supabaseService.RECEIPTS_BUCKET,
        receipt.file_path
      );
    } catch (storageErr) {
      const localPath = path.join(__dirname, '..', 'uploads', 'receipts', receipt.file_path);
      if (fs.existsSync(localPath)) {
        fileBuffer = fs.readFileSync(localPath);
      } else {
        return res.status(404).json({ success: false, message: 'File not found in storage.' });
      }
    }

    res.setHeader('Content-Type', receipt.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${receipt.file_name}"`);
    return res.status(200).send(fileBuffer);
  } catch (error) {
    next(error);
  }
}

// GET /api/documents/receipts/:id/signed-url
async function getReceiptSignedUrl(req, res, next) {
  try {
    const { id } = req.params;
    const receipt = await documentModel.getReceiptById(id);

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found.' });
    }

    if (req.user.role !== 'admin' && receipt.product_owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const expiresIn = parseInt(req.query.expiresIn || '3600', 10);
    const signedUrl = await supabaseService.createSignedUrl(
      supabaseService.RECEIPTS_BUCKET,
      receipt.file_path,
      expiresIn
    );

    return res.status(200).json({
      success: true,
      data: {
        id: receipt.id,
        file_name: receipt.file_name,
        signed_url: signedUrl,
        expires_in_seconds: expiresIn,
      },
    });
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

    // Delete object from Supabase Storage
    try {
      await supabaseService.deleteFile(supabaseService.RECEIPTS_BUCKET, receipt.file_path);
    } catch (err) {
      console.warn('Could not delete receipt from Supabase storage:', err.message);
    }

    // Clean up local file if legacy file exists
    const localPath = path.join(__dirname, '..', 'uploads', 'receipts', receipt.file_path);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
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
      return res.status(404).json({
        success: false,
        message: 'Associated warranty not found or access denied.',
      });
    }

    // Generate unique file name and storage path: warranty-documents/{authenticatedUserId}/{uniqueFileName}
    const uniqueFileName = supabaseService.sanitizeFileName(req.file.originalname, 'warranty-doc');
    const storagePath = `${req.user.id}/${uniqueFileName}`;

    // Upload memory buffer directly to Supabase Storage private bucket
    await supabaseService.uploadFile(
      supabaseService.WARRANTY_DOCS_BUCKET,
      storagePath,
      req.file.buffer,
      req.file.mimetype
    );

    // Store metadata and storage path in PostgreSQL
    const doc = await documentModel.createWarrantyDoc({
      warranty_id: parseInt(warrantyId, 10),
      file_name: req.file.originalname,
      file_path: storagePath,
      file_type: req.file.mimetype,
      file_size: req.file.size,
    });

    return res.status(201).json({
      success: true,
      message: 'Warranty document uploaded successfully.',
      data: doc,
    });
  } catch (error) {
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

    // Optional query parameter for signed URL response or redirect
    if (req.query.format === 'url') {
      const signedUrl = await supabaseService.createSignedUrl(
        supabaseService.WARRANTY_DOCS_BUCKET,
        doc.file_path,
        3600
      );
      return res.status(200).json({ success: true, signedUrl });
    }

    if (req.query.redirect === 'true') {
      const signedUrl = await supabaseService.createSignedUrl(
        supabaseService.WARRANTY_DOCS_BUCKET,
        doc.file_path,
        300
      );
      return res.redirect(signedUrl);
    }

    // Stream / send buffer from Supabase Storage (with fallback to local disk for legacy files)
    let fileBuffer = null;
    try {
      fileBuffer = await supabaseService.downloadFile(
        supabaseService.WARRANTY_DOCS_BUCKET,
        doc.file_path
      );
    } catch (storageErr) {
      const localPath = path.join(__dirname, '..', 'uploads', 'warranties', doc.file_path);
      if (fs.existsSync(localPath)) {
        fileBuffer = fs.readFileSync(localPath);
      } else {
        return res.status(404).json({ success: false, message: 'File not found in storage.' });
      }
    }

    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.file_name}"`);
    return res.status(200).send(fileBuffer);
  } catch (error) {
    next(error);
  }
}

// GET /api/documents/warranties/:id/signed-url
async function getWarrantyDocSignedUrl(req, res, next) {
  try {
    const { id } = req.params;
    const doc = await documentModel.getWarrantyDocById(id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Warranty document not found.' });
    }

    if (req.user.role !== 'admin' && doc.product_owner_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access forbidden.' });
    }

    const expiresIn = parseInt(req.query.expiresIn || '3600', 10);
    const signedUrl = await supabaseService.createSignedUrl(
      supabaseService.WARRANTY_DOCS_BUCKET,
      doc.file_path,
      expiresIn
    );

    return res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        file_name: doc.file_name,
        signed_url: signedUrl,
        expires_in_seconds: expiresIn,
      },
    });
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

    // Delete object from Supabase Storage
    try {
      await supabaseService.deleteFile(supabaseService.WARRANTY_DOCS_BUCKET, doc.file_path);
    } catch (err) {
      console.warn('Could not delete warranty doc from Supabase storage:', err.message);
    }

    // Clean up local legacy file if exists
    const localPath = path.join(__dirname, '..', 'uploads', 'warranties', doc.file_path);
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
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
  getReceiptSignedUrl,
  deleteReceipt,
  uploadWarrantyDoc,
  downloadWarrantyDoc,
  getWarrantyDocSignedUrl,
  deleteWarrantyDoc,
  getAllDocuments,
};
