const request = require('supertest');
const { app, setupTestDb } = require('./setup');

describe('CRUD Area 4: Category Management & Role Authorization', () => {
  let adminToken;
  let userToken;
  let createdCategoryId;

  beforeAll(async () => {
    const data = await setupTestDb();
    adminToken = data.adminToken;
    userToken = data.userToken;
  });

  it('Normal User: should be able to view categories list', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('Normal User: should NOT be permitted to create a category (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Unauthorized Category',
        description: 'Should fail',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Admin: should create a new category (Create)', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Smart Home & IoT Devices',
        description: 'Smart thermostats, smart bulbs, security sensors, and IoT hubs.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Smart Home & IoT Devices');
    createdCategoryId = res.body.data.id;
  });

  it('Admin: should reject duplicate category name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Smart Home & IoT Devices',
        description: 'Duplicate attempt',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Admin: should update an existing category (Update)', async () => {
    const res = await request(app)
      .put(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Smart Home & Connected Devices',
        description: 'Updated description for smart home gadgets.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Smart Home & Connected Devices');
  });

  it('Admin: should delete a category (Delete)', async () => {
    const res = await request(app)
      .delete(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const checkRes = await request(app)
      .get(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(checkRes.statusCode).toBe(404);
  });
});
