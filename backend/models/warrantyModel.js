const db = require('../config/db');
const { calculateWarrantyStatus, enrichWarrantyRecord } = require('../services/warrantyService');

async function create({
  product_id,
  provider,
  warranty_type,
  start_date,
  end_date,
  coverage_details,
}) {
  const result = await db.query(
    `INSERT INTO warranties (product_id, provider, warranty_type, start_date, end_date, coverage_details)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      product_id,
      provider.trim(),
      warranty_type.trim(),
      start_date,
      end_date,
      coverage_details ? coverage_details.trim() : null,
    ]
  );
  return enrichWarrantyRecord(result.rows[0]);
}

async function getById(id, userId = null, role = null) {
  let queryText = `
    SELECT w.*,
           p.name AS product_name,
           p.brand AS product_brand,
           p.model AS product_model,
           p.user_id AS product_owner_id,
           u.name AS owner_name,
           u.email AS owner_email,
           COALESCE(wd_counts.document_count, 0) AS document_count
    FROM warranties w
    JOIN products p ON p.id = w.product_id
    JOIN users u ON u.id = p.user_id
    LEFT JOIN (SELECT warranty_id, COUNT(*) AS document_count FROM warranty_documents GROUP BY warranty_id) wd_counts ON wd_counts.warranty_id = w.id
    WHERE w.id = $1
  `;
  const params = [id];

  if (role !== 'admin' && userId) {
    queryText += ' AND p.user_id = $2';
    params.push(userId);
  }

  const result = await db.query(queryText, params);
  if (result.rows.length === 0) return null;
  return enrichWarrantyRecord(result.rows[0]);
}

async function getByProductId(productId, userId = null, role = null) {
  let queryText = `
    SELECT w.*,
           p.name AS product_name,
           p.brand AS product_brand,
           p.user_id AS product_owner_id
    FROM warranties w
    JOIN products p ON p.id = w.product_id
    WHERE w.product_id = $1
  `;
  const params = [productId];

  if (role !== 'admin' && userId) {
    queryText += ' AND p.user_id = $2';
    params.push(userId);
  }

  const result = await db.query(queryText, params);
  if (result.rows.length === 0) return null;
  return enrichWarrantyRecord(result.rows[0]);
}

async function getAll({ userId, role, status, page = 1, limit = 10, search }) {
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
      `(LOWER(p.name) LIKE $${paramIndex} OR LOWER(w.provider) LIKE $${paramIndex} OR LOWER(w.warranty_type) LIKE $${paramIndex})`
    );
    params.push(searchPattern);
    paramIndex++;
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const queryText = `
    SELECT w.*,
           p.name AS product_name,
           p.brand AS product_brand,
           p.model AS product_model,
           p.serial_number,
           u.name AS owner_name,
           u.email AS owner_email,
           COALESCE(wd_counts.document_count, 0) AS document_count
    FROM warranties w
    JOIN products p ON p.id = w.product_id
    JOIN users u ON u.id = p.user_id
    LEFT JOIN (SELECT warranty_id, COUNT(*) AS document_count FROM warranty_documents GROUP BY warranty_id) wd_counts ON wd_counts.warranty_id = w.id
    ${whereSQL}
    ORDER BY w.end_date ASC
  `;

  const result = await db.query(queryText, params);
  let enriched = result.rows.map(enrichWarrantyRecord);

  if (status && status.trim()) {
    const target = status.trim().toLowerCase();
    enriched = enriched.filter((item) => item.status.toLowerCase() === target);
  }

  const total = enriched.length;
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const offset = (pageNum - 1) * limitNum;
  const paginated = enriched.slice(offset, offset + limitNum);

  return {
    warranties: paginated,
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

  const { provider, warranty_type, start_date, end_date, coverage_details } = fields;

  const result = await db.query(
    `UPDATE warranties
     SET provider = COALESCE($1, provider),
         warranty_type = COALESCE($2, warranty_type),
         start_date = COALESCE($3, start_date),
         end_date = COALESCE($4, end_date),
         coverage_details = COALESCE($5, coverage_details),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $6
     RETURNING *`,
    [
      provider ? provider.trim() : null,
      warranty_type ? warranty_type.trim() : null,
      start_date || null,
      end_date || null,
      coverage_details !== undefined ? (coverage_details ? coverage_details.trim() : null) : null,
      id,
    ]
  );

  return enrichWarrantyRecord(result.rows[0]);
}

async function deleteWarranty(id, userId = null, role = null) {
  const existing = await getById(id, userId, role);
  if (!existing) return null;

  const result = await db.query(
    'DELETE FROM warranties WHERE id = $1 RETURNING id, provider',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Find expiring warranties for automated email reminders
 */
async function getExpiringWarrantiesForReminder(userId = null) {
  let queryText = `
    SELECT w.*,
           p.id AS product_id,
           p.name AS product_name,
           p.brand AS product_brand,
           u.id AS user_id,
           u.name AS user_name,
           u.email AS user_email
    FROM warranties w
    JOIN products p ON p.id = w.product_id
    JOIN users u ON u.id = p.user_id
    WHERE w.end_date >= CURRENT_DATE
  `;
  const params = [];

  if (userId) {
    queryText += ' AND u.id = $1';
    params.push(userId);
  }

  const result = await db.query(queryText, params);
  const items = result.rows.map(enrichWarrantyRecord);

  // Filter only those expiring in 0-30 days
  return items.filter((item) => item.is_expiring_soon);
}

module.exports = {
  create,
  getById,
  getByProductId,
  getAll,
  update,
  deleteWarranty,
  getExpiringWarrantiesForReminder,
};
