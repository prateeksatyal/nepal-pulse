const serviceModel = require('../models/serviceModel');
const productModel = require('../models/productModel');

// GET /api/services
async function getServices(req, res, next) {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const result = await serviceModel.getAll({
      userId: req.user.id,
      role: req.user.role,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });

    return res.status(200).json({
      success: true,
      data: result.services,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/services/:id
async function getServiceById(req, res, next) {
  try {
    const { id } = req.params;
    const serviceRecord = await serviceModel.getById(id, req.user.id, req.user.role);

    if (!serviceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Service/repair record not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      data: serviceRecord,
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/services
async function createService(req, res, next) {
  try {
    const { product_id, service_date, service_center, description, cost, notes } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }
    if (!service_date) {
      return res.status(400).json({ success: false, message: 'Service date is required.' });
    }
    if (!service_center || !service_center.trim()) {
      return res.status(400).json({ success: false, message: 'Service center name is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Service description is required.' });
    }

    // Verify product ownership
    const product = await productModel.getById(product_id, req.user.id, req.user.role);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Associated product not found or you do not have permission to add service records to it.',
      });
    }

    const newRecord = await serviceModel.create({
      product_id,
      service_date,
      service_center,
      description,
      cost: cost !== undefined && cost !== '' ? parseFloat(cost) : 0.00,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Service record created successfully.',
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/services/:id
async function updateService(req, res, next) {
  try {
    const { id } = req.params;
    const { service_date, service_center, description, cost, notes } = req.body;

    const existing = await serviceModel.getById(id, req.user.id, req.user.role);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found or access denied.',
      });
    }

    const updated = await serviceModel.update(
      id,
      {
        service_date,
        service_center,
        description,
        cost: cost !== undefined && cost !== '' ? parseFloat(cost) : undefined,
        notes,
      },
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: 'Service record updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/services/:id
async function deleteService(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await serviceModel.getById(id, req.user.id, req.user.role);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Service record not found or access denied.',
      });
    }

    await serviceModel.deleteService(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: 'Service record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
