const productModel = require('../models/productModel');
const warrantyModel = require('../models/warrantyModel');
const serviceModel = require('../models/serviceModel');
const documentModel = require('../models/documentModel');

// GET /api/products
async function getProducts(req, res, next) {
  try {
    const {
      search,
      category_id,
      status,
      brand,
      sort_by,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await productModel.getAll({
      userId: req.user.id,
      role: req.user.role,
      search,
      categoryId: category_id ? parseInt(category_id, 10) : null,
      status,
      brand,
      sortBy: sort_by,
      order,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    return res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/products/:id
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await productModel.getById(id, req.user.id, req.user.role);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not have permission to view it.',
      });
    }

    // Fetch related records: warranty, service records, receipts, and warranty documents
    const [warranty, serviceRecords, receipts] = await Promise.all([
      warrantyModel.getByProductId(product.id, req.user.id, req.user.role),
      serviceModel.getByProductId(product.id, req.user.id, req.user.role),
      documentModel.getReceiptByProductId(product.id),
    ]);

    let warrantyDocuments = [];
    if (warranty && warranty.id) {
      warrantyDocuments = await documentModel.getWarrantyDocByWarrantyId(warranty.id);
    }

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        warranty: warranty || null,
        service_records: serviceRecords || [],
        receipts: receipts || [],
        warranty_documents: warrantyDocuments || [],
      },
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/products
async function createProduct(req, res, next) {
  try {
    const {
      category_id,
      name,
      brand,
      model,
      serial_number,
      purchase_date,
      purchase_price,
      notes,
      warranty,
    } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }
    if (!brand || !brand.trim()) {
      return res.status(400).json({ success: false, message: 'Brand is required.' });
    }
    if (!purchase_date) {
      return res.status(400).json({ success: false, message: 'Purchase date is required.' });
    }

    const newProduct = await productModel.create({
      user_id: req.user.id,
      category_id: category_id ? parseInt(category_id, 10) : null,
      name,
      brand,
      model,
      serial_number,
      purchase_date,
      purchase_price: purchase_price !== undefined && purchase_price !== '' ? parseFloat(purchase_price) : 0,
      notes,
    });

    let createdWarranty = null;
    // Optional: create warranty together if provided
    if (warranty && warranty.provider && warranty.end_date) {
      createdWarranty = await warrantyModel.create({
        product_id: newProduct.id,
        provider: warranty.provider,
        warranty_type: warranty.warranty_type || 'Manufacturer',
        start_date: warranty.start_date || purchase_date,
        end_date: warranty.end_date,
        coverage_details: warranty.coverage_details,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: {
        ...newProduct,
        warranty: createdWarranty,
      },
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/products/:id
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      brand,
      model,
      serial_number,
      purchase_date,
      purchase_price,
      notes,
    } = req.body;

    // Verify existing & ownership
    const existing = await productModel.getById(id, req.user.id, req.user.role);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied.',
      });
    }

    const updated = await productModel.update(
      id,
      {
        category_id: category_id !== undefined ? (category_id ? parseInt(category_id, 10) : null) : undefined,
        name,
        brand,
        model,
        serial_number,
        purchase_date,
        purchase_price: purchase_price !== undefined && purchase_price !== '' ? parseFloat(purchase_price) : undefined,
        notes,
      },
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await productModel.getById(id, req.user.id, req.user.role);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or access denied.',
      });
    }

    await productModel.deleteProduct(id, req.user.id, req.user.role);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
