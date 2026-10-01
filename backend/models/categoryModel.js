const db = require('../config/db');

async function getAll() {
  const result = await db.query(
    `SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
            COALESCE(p_counts.product_count, 0) AS product_count
     FROM categories c
     LEFT JOIN (
       SELECT category_id, COUNT(id) AS product_count
       FROM products
       GROUP BY category_id
     ) p_counts ON p_counts.category_id = c.id
     ORDER BY c.name ASC`
  );
  return result.rows;
}

async function getById(id) {
  const result = await db.query(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function findByName(name) {
  const result = await db.query(
    'SELECT * FROM categories WHERE LOWER(name) = LOWER($1)',
    [name]
  );
  return result.rows[0] || null;
}

async function create({ name, description }) {
  const result = await db.query(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     RETURNING id, name, description, created_at, updated_at`,
    [name.trim(), description ? description.trim() : null]
  );
  return result.rows[0];
}

async function update(id, { name, description }) {
  const result = await db.query(
    `UPDATE categories
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, name, description, updated_at`,
    [name ? name.trim() : null, description ? description.trim() : null, id]
  );
  return result.rows[0] || null;
}

async function deleteCategory(id) {
  const result = await db.query(
    'DELETE FROM categories WHERE id = $1 RETURNING id, name',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAll,
  getById,
  findByName,
  create,
  update,
  deleteCategory,
};
