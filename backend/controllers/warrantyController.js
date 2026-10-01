const warrantyModel = require('../models/warrantyModel');
const productModel = require('../models/productModel');
const documentModel = require('../models/documentModel');
const emailService = require('../services/emailService');

// GET /api/warranties
async function getWarranties(req, res, next) {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const result = await warrantyModel.getAll({
      userId: req.user.id,
      role: req.user.role,
      status,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });

    return res.status(200).json({
      success: true,
      data: result.warranties,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/warranties/:id
async function getWarrantyById(req, res, next) {
  try {
    const { id } = req.params;
    const warranty = await warrantyModel.getById(id, req.user.id, req.user.role);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty record not found or access denied.',
      });
    }

    const documents = await documentModel.getWarrantyDocByWarrantyId(warranty.id);

    return res.status(200).json({
      success: true,
      data: {
        ...warranty,
        documents: documents || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/warranties
async function createWarranty(req, res, next) {
  try {
    const {
      product_id,
      provider,
      warranty_type,
      start_date,
      end_date,
      coverage_details,
    } = req.body;

    // Validation
    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }
    if (!provider || !provider.trim()) {
      return res.status(400).json({ success: false, message: 'Warranty provider is required.' });
    }
    if (!warranty_type || !warranty_type.trim()) {
      return res.status(400).json({ success: false, message: 'Warranty type is required.' });
    }
    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Both start date and end date are required.',
      });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    // Verify product ownership
    const product = await productModel.getById(product_id, req.user.id, req.user.role);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Associated product not found or you do not have permission to attach a warranty to it.',
      });
    }

    // Check if warranty already exists for this product
    const existing = await warrantyModel.getByProductId(product_id, req.user.id, req.user.role);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A warranty record already exists for this product. Please update the existing warranty.',
      });
    }

    const newWarranty = await warrantyModel.create({
      product_id,
      provider,
      warranty_type,
      start_date,
      end_date,
      coverage_details,
    });

    return res.status(201).json({
      success: true,
      message: 'Warranty created successfully.',
      data: newWarranty,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/warranties/:id
async function updateWarranty(req, res, next) {
  try {
    const { id } = req.params;
    const { provider, warranty_type, start_date, end_date, coverage_details } = req.body;

    const existing = await warrantyModel.getById(id, req.user.id, req.user.role);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found or access denied.',
      });
    }

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    const updated = await warrantyModel.update(
      id,
      { provider, warranty_type, start_date, end_date, coverage_details },
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: 'Warranty updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/warranties/:id
async function deleteWarranty(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await warrantyModel.getById(id, req.user.id, req.user.role);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Warranty not found or access denied.',
      });
    }

    await warrantyModel.deleteWarranty(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: 'Warranty deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/warranties/:id/send-reminder
// Feature 10: Trigger expiry email reminder
async function sendReminder(req, res, next) {
  try {
    const { id } = req.params;
    const warranty = await warrantyModel.getById(id, req.user.id, req.user.role);

    if (!warranty) {
      return res.status(404).json({
        success: false,
        message: 'Warranty record not found.',
      });
    }

    const recipientEmail = req.body.email || warranty.owner_email || req.user.email;
    const recipientName = warranty.owner_name || req.user.name;

    const emailResult = await emailService.sendWarrantyReminder(
      recipientEmail,
      recipientName,
      {
        productName: warranty.product_name,
        provider: warranty.provider,
        endDate: warranty.end_date,
        daysRemaining: warranty.days_remaining,
        productId: warranty.product_id,
        warrantyId: warranty.id,
      }
    );

    return res.status(200).json({
      success: true,
      message: `Warranty reminder email sent to ${recipientEmail}.`,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWarranties,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  deleteWarranty,
  sendReminder,
};
