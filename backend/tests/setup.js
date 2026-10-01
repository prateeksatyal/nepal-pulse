const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const { seedDatabase } = require('../database/initDb');

let adminToken = '';
let userToken = '';
let seededData = null;

async function setupTestDb() {
  process.env.USE_IN_MEMORY_DB = 'true';
  process.env.NODE_ENV = 'test';
  await db.initializeDb();
  await seedDatabase();

  // Login as Admin
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@warranty.com', password: 'admin123' });
  adminToken = adminLogin.body.token;

  // Login as Normal User
  const userLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@warranty.com', password: 'user123' });
  userToken = userLogin.body.token;

  return { adminToken, userToken, app };
}

module.exports = {
  setupTestDb,
  getAdminToken: () => adminToken,
  getUserToken: () => userToken,
  app,
};
