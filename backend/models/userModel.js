const db = require('../config/db');

async function findByEmail(email) {
  const result = await db.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await db.query(
    'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function create({ name, email, password, role = 'user' }) {
  const result = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email.toLowerCase(), password, role]
  );
  return result.rows[0];
}

async function getAllUsers() {
  const result = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at, u.updated_at,
            COUNT(DISTINCT p.id) AS product_count
     FROM users u
     LEFT JOIN products p ON p.user_id = u.id
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return result.rows;
}

async function updateUser(id, { name, role }) {
  const result = await db.query(
    `UPDATE users 
     SET name = COALESCE($1, name),
         role = COALESCE($2, role),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, name, email, role, updated_at`,
    [name, role, id]
  );
  return result.rows[0] || null;
}

async function deleteUser(id) {
  const result = await db.query(
    'DELETE FROM users WHERE id = $1 RETURNING id, email',
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  create,
  getAllUsers,
  updateUser,
  deleteUser,
};
