const db = require('../config/db');

async function create({
  product_id,
  service_date,
  service_center,
  description,
  cost,
  notes,
}) {
  const result = await db.query(
    `INSERT INTO service_records (product_id, service_date, service_center, description, cost, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      product_id,
      service_date,
      service_center.trim(),
      description.trim(),
      cost !== undefined && cost !== '' ? cost : 0.00,
      notes ? notes.trim() : null,
    ]
  );
  return result.rows[0];
}

async function getById(id, userId = null, role = null) {
  let queryText = `
    SELECT sr.*,
           p.name AS product_name,
           p.brand AS product_brand,
           p.model AS product_model,
           p.user_id AS product_owner_id,
           u.name AS owner_name,
           u.email AS owner_email
    FROM service_records sr
    JOIN products p ON p.id = sr.product_id
    JOIN users u ON u.id = p.user_id
    WHERE sr.id = $1
  `;
  const params = [id];

  if (role !== 'admin' && userId) {
    queryText += ' AND p.user_id = $2';
    params.push(userId);
  }

  const result = await db.query(queryText, params);
  return result.rows[0] || null;
}

async function getByProductId(productId, userId = null, role = null) {
  let queryText = `
    SELECT sr.*,
           p.name AS product_name,
           p.brand AS product_brand
    FROM service_records sr
    JOIN products p ON p.id = sr.product_id
    WHERE sr.product_id = $1
  `;
  const params = [productId];

  if (role !== 'admin' && userId) {
    queryText += ' AND p.user_id = $2';
    params.push(userId);
  }

  queryText += ' ORDER BY sr.service_date DESC';
  const result = await db.query(queryText, params);
  return result.rows;
}

async function getAll({ userId, role, page = 1, limit = 10, search }) {
  const whereClauses = [];
  const params = [];
  let paramIndex = 1;

  if (role !== 'admin' && userId) {
    whereClauses.push(`p.user_id = $${paramIndex++}`);
    params.push(userId);
  }

  if (search && search.trim()) {
    const searchPattern = `%${search.trim().toLowerCase()}%`;
    whereClauses.push(
      `(LOWER(p.name) LIKE $${paramIndex} OR LOWER(sr.service_center) LIKE $${paramIndex} OR LOWER(sr.description) LIKE $${paramIndex})`
    );
    params.push(searchPattern);
    paramIndex++;
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM service_records sr
    JOIN products p ON p.id = sr.product_id
    ${whereSQL}
  `;

  const dataQuery = `
    SELECT sr.*,
           p.name AS product_name,
           p.brand AS product_brand,
           p.model AS product_model,
           u.name AS owner_name,
           u.email AS owner_email
    FROM service_records sr
    JOIN products p ON p.id = sr.product_id
    JOIN users u ON u.id = p.user_id
    ${whereSQL}
    ORDER BY sr.service_date DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;

  const countResult = await db.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  const dataResult = await db.query(dataQuery, [...params, limitNum, offset]);

  return {
    services: dataResult.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function update(id, fields, userId = null, role = null) {
  const existing = await getById(id, userId, role);
  if (!existing) return null;

  const { service_date, service_center, description, cost, notes } = fields;

  const result = await db.query(
    `UPDATE service_records
     SET service_date = COALESCE($1, service_date),
         service_center = COALESCE($2, service_center),
         description = COALESCE($3, description),
         cost = COALESCE($4, cost),
         notes = COALESCE($5, notes),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [
      service_date || null,
      service_center ? service_center.trim() : null,
      description ? description.trim() : null,
      cost !== undefined && cost !== '' ? cost : null,
      notes !== undefined ? (notes ? notes.trim() : null) : null,
      id,
    ]
  );

  return result.rows[0];
}

async function deleteService(id, userId = null, role = null) {
  const existing = await getById(id, userId, role);
  if (!existing) return null;

  const result = await db.query(
    'DELETE FROM service_records WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  create,
  getById,
  getByProductId,
  getAll,
  update,
  deleteService,
};
