const db = require('../config/db');
const { calculateWarrantyStatus } = require('../services/warrantyService');

async function create({
  user_id,
  category_id,
  name,
  brand,
  model,
  serial_number,
  purchase_date,
  purchase_price,
  notes,
}) {
  const result = await db.query(
    `INSERT INTO products 
      (user_id, category_id, name, brand, model, serial_number, purchase_date, purchase_price, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      user_id,
      category_id || null,
      name.trim(),
      brand.trim(),
      model ? model.trim() : null,
      serial_number ? serial_number.trim() : null,
      purchase_date,
      purchase_price || 0.00,
      notes ? notes.trim() : null,
    ]
  );
  return result.rows[0];
}

async function getById(id, userId = null, role = null) {
  let queryText = `
    SELECT p.*,
           c.name AS category_name,
           u.name AS owner_name,
           u.email AS owner_email,
           w.id AS warranty_id,
           w.provider AS warranty_provider,
           w.warranty_type,
           w.start_date AS warranty_start_date,
           w.end_date AS warranty_end_date,
           w.coverage_details AS warranty_coverage
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN users u ON u.id = p.user_id
    LEFT JOIN warranties w ON w.product_id = p.id
    WHERE p.id = $1
  `;
  const params = [id];

  // If normal user, enforce ownership
  if (role !== 'admin' && userId) {
    queryText += ' AND p.user_id = $2';
    params.push(userId);
  }

  const result = await db.query(queryText, params);
  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const warrantyStatus = calculateWarrantyStatus(row.warranty_end_date);

  return {
    ...row,
    warranty_status: warrantyStatus.status,
    days_remaining: warrantyStatus.daysRemaining,
    badge_color: warrantyStatus.badgeColor,
  };
}

/**
 * Feature 5 & 6: Search, Filter, Sort, and Paginate Products
 */
async function getAll({
  userId,
  role,
  search,
  categoryId,
  status,
  brand,
  sortBy = 'created_at',
  order = 'DESC',
  page = 1,
  limit = 10,
}) {
  const whereClauses = [];
  const params = [];
  let paramIndex = 1;

  // Normal users see only their products; Admin sees all
  if (role !== 'admin') {
    whereClauses.push(`p.user_id = $${paramIndex++}`);
    params.push(userId);
  }

  // Feature 5: Search by product name, brand, model, serial_number
  if (search && search.trim()) {
    const searchPattern = `%${search.trim().toLowerCase()}%`;
    whereClauses.push(
      `(LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.brand) LIKE $${paramIndex} OR LOWER(COALESCE(p.model, '')) LIKE $${paramIndex} OR LOWER(COALESCE(p.serial_number, '')) LIKE $${paramIndex})`
    );
    params.push(searchPattern);
    paramIndex++;
  }

  // Filter by Category
  if (categoryId) {
    whereClauses.push(`p.category_id = $${paramIndex++}`);
    params.push(categoryId);
  }

  // Filter by Brand
  if (brand && brand.trim()) {
    whereClauses.push(`LOWER(p.brand) = LOWER($${paramIndex++})`);
    params.push(brand.trim());
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // Valid sort columns
  const allowedSortColumns = {
    name: 'p.name',
    brand: 'p.brand',
    purchase_date: 'p.purchase_date',
    created_at: 'p.created_at',
    purchase_price: 'p.purchase_price',
    warranty_end_date: 'w.end_date',
  };
  const sortColumn = allowedSortColumns[sortBy] || 'p.created_at';
  const sortDirection = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const baseQuery = `
    SELECT p.*,
           c.name AS category_name,
           u.name AS owner_name,
           u.email AS owner_email,
           w.id AS warranty_id,
           w.provider AS warranty_provider,
           w.warranty_type,
           w.start_date AS warranty_start_date,
           w.end_date AS warranty_end_date,
           w.coverage_details AS warranty_coverage,
           COALESCE(sr_counts.service_count, 0) AS service_count,
           COALESCE(r_counts.receipt_count, 0) AS receipt_count
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN users u ON u.id = p.user_id
    LEFT JOIN warranties w ON w.product_id = p.id
    LEFT JOIN (SELECT product_id, COUNT(*) AS service_count FROM service_records GROUP BY product_id) sr_counts ON sr_counts.product_id = p.id
    LEFT JOIN (SELECT product_id, COUNT(*) AS receipt_count FROM receipts GROUP BY product_id) r_counts ON r_counts.product_id = p.id
    ${whereSQL}
    ORDER BY ${sortColumn} ${sortDirection}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM products p
    LEFT JOIN warranties w ON w.product_id = p.id
    ${whereSQL}
  `;

  // Fetch all matching rows
  const [dataResult, countResult] = await Promise.all([
    db.query(baseQuery, params),
    db.query(countQuery, params),
  ]);

  // Enrich with automatic warranty status
  let items = dataResult.rows.map((row) => {
    const warrantyStatus = calculateWarrantyStatus(row.warranty_end_date);
    return {
      ...row,
      warranty_status: warrantyStatus.status,
      days_remaining: warrantyStatus.daysRemaining,
      badge_color: warrantyStatus.badgeColor,
    };
  });

  // Feature 6: Filter by Warranty Status (Active, Expiring Soon, Expired, No Warranty)
  if (status && status.trim()) {
    const targetStatus = status.trim().toLowerCase();
    items = items.filter((item) => item.warranty_status.toLowerCase() === targetStatus);
  }

  const total = items.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;
  const paginatedItems = items.slice(offset, offset + limitNum);

  return {
    products: paginatedItems,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function update(id, fields, userId = null, role = null) {
  // Check ownership
  const existing = await getById(id, userId, role);
  if (!existing) return null;

  const {
    category_id,
    name,
    brand,
    model,
    serial_number,
    purchase_date,
    purchase_price,
    notes,
  } = fields;

  const result = await db.query(
    `UPDATE products
     SET category_id = COALESCE($1, category_id),
         name = COALESCE($2, name),
         brand = COALESCE($3, brand),
         model = COALESCE($4, model),
         serial_number = COALESCE($5, serial_number),
         purchase_date = COALESCE($6, purchase_date),
         purchase_price = COALESCE($7, purchase_price),
         notes = COALESCE($8, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING *`,
    [
      category_id !== undefined ? category_id : null,
      name ? name.trim() : null,
      brand ? brand.trim() : null,
      model !== undefined ? (model ? model.trim() : null) : null,
      serial_number !== undefined ? (serial_number ? serial_number.trim() : null) : null,
      purchase_date || null,
      purchase_price !== undefined ? purchase_price : null,
      notes !== undefined ? (notes ? notes.trim() : null) : null,
      id,
    ]
  );

  return result.rows[0];
}

async function deleteProduct(id, userId = null, role = null) {
  const existing = await getById(id, userId, role);
  if (!existing) return null;

  const result = await db.query(
    'DELETE FROM products WHERE id = $1 RETURNING id, name',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  getById,
  getAll,
  update,
  deleteProduct,
};
