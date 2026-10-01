const db = require('../config/db');

// --- RECEIPTS ---

async function createReceipt({ product_id, file_name, file_path, file_type, file_size }) {
  const result = await db.query(
    `INSERT INTO receipts (product_id, file_name, file_path, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [product_id, file_name, file_path, file_type, file_size]
  );
  return result.rows[0];
}

async function getReceiptById(id) {
  const result = await db.query(
    `SELECT r.*, p.name AS product_name, p.user_id AS product_owner_id
     FROM receipts r
     JOIN products p ON p.id = r.product_id
     WHERE r.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getReceiptByProductId(productId) {
  const result = await db.query(
    'SELECT * FROM receipts WHERE product_id = $1 ORDER BY uploaded_at DESC',
    [productId]
  );
  return result.rows;
}

async function deleteReceipt(id) {
  const result = await db.query(
    'DELETE FROM receipts WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

// --- WARRANTY DOCUMENTS ---

async function createWarrantyDoc({ warranty_id, file_name, file_path, file_type, file_size }) {
  const result = await db.query(
    `INSERT INTO warranty_documents (warranty_id, file_name, file_path, file_type, file_size)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [warranty_id, file_name, file_path, file_type, file_size]
  );
  return result.rows[0];
}

async function getWarrantyDocById(id) {
  const result = await db.query(
    `SELECT wd.*, w.product_id, p.name AS product_name, p.user_id AS product_owner_id
     FROM warranty_documents wd
     JOIN warranties w ON w.id = wd.warranty_id
     JOIN products p ON p.id = w.product_id
     WHERE wd.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getWarrantyDocByWarrantyId(warrantyId) {
  const result = await db.query(
    'SELECT * FROM warranty_documents WHERE warranty_id = $1 ORDER BY uploaded_at DESC',
    [warrantyId]
  );
  return result.rows;
}

async function deleteWarrantyDoc(id) {
  const result = await db.query(
    'DELETE FROM warranty_documents WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

// Combined list of all documents (receipts and warranty docs)
async function getAllDocuments({ userId, role }) {
  let receiptsQuery = `
    SELECT r.id, 'receipt' AS doc_type, r.file_name, r.file_path, r.file_type, r.file_size, r.uploaded_at,
           p.id AS product_id, p.name AS product_name, p.brand AS product_brand,
           u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM receipts r
    JOIN products p ON p.id = r.product_id
    JOIN users u ON u.id = p.user_id
  `;

  let warrantyDocsQuery = `
    SELECT wd.id, 'warranty_doc' AS doc_type, wd.file_name, wd.file_path, wd.file_type, wd.file_size, wd.uploaded_at,
           p.id AS product_id, p.name AS product_name, p.brand AS product_brand,
           u.id AS user_id, u.name AS user_name, u.email AS user_email
    FROM warranty_documents wd
    JOIN warranties w ON w.id = wd.warranty_id
    JOIN products p ON p.id = w.product_id
    JOIN users u ON u.id = p.user_id
  `;

  const params = [];
  if (role !== 'admin' && userId) {
    receiptsQuery += ' WHERE p.user_id = $1';
    warrantyDocsQuery += ' WHERE p.user_id = $1';
    params.push(userId);
  }

  const [receiptsRes, warrantyDocsRes] = await Promise.all([
    db.query(receiptsQuery, params),
    db.query(warrantyDocsQuery, params),
  ]);

  const combined = [...receiptsRes.rows, ...warrantyDocsRes.rows];
  combined.sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at));
  return combined;
}

module.exports = {
  createReceipt,
  getReceiptById,
  getReceiptByProductId,
  deleteReceipt,
  createWarrantyDoc,
  getWarrantyDocById,
  getWarrantyDocByWarrantyId,
  deleteWarrantyDoc,
  getAllDocuments,
};
