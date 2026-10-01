const request = require('supertest');
const { app, setupTestDb } = require('./setup');

describe('CRUD Area 1: Product Management, Search & Filtering', () => {
  let userToken;
  let adminToken;
  let createdProductId;

  beforeAll(async () => {
    const data = await setupTestDb();
    userToken = data.userToken;
    adminToken = data.adminToken;
  });

  it('Feature 1: User creates a product (Create)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'MacBook Air M2',
        brand: 'Apple',
        model: 'MBA-M2-2023',
        serial_number: 'C02G80L7MD6R',
        purchase_date: '2023-11-20',
        purchase_price: 1199.00,
        notes: 'Silver 13-inch MacBook Air with 16GB unified memory.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('MacBook Air M2');
    expect(res.body.data.brand).toBe('Apple');
    createdProductId = res.body.data.id;
  });

  it('Validation: Rejects product creation without required fields', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: '',
        brand: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Feature 1: Reads product list (Read)', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('Feature 5: Debounced Search by name, brand, or model', async () => {
    const res = await request(app)
      .get('/api/products?search=MacBook')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toContain('MacBook');
  });

  it('Feature 6: Filtering by Brand', async () => {
    const res = await request(app)
      .get('/api/products?brand=Apple')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.every((p) => p.brand.toLowerCase() === 'apple')).toBe(true);
  });

  it('Feature 1: Reads single product details with associations (Read Details)', async () => {
    const res = await request(app)
      .get(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdProductId);
    expect(res.body.data.service_records).toBeDefined();
    expect(res.body.data.receipts).toBeDefined();
  });

  it('Feature 1: Updates product information (Update)', async () => {
    const res = await request(app)
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'MacBook Air M2 13-inch',
        purchase_price: 1149.00,
        notes: 'Price updated after rebate check.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('MacBook Air M2 13-inch');
  });

  it('Feature 1: Deletes product (Delete)', async () => {
    const res = await request(app)
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify deletion
    const verifyRes = await request(app)
      .get(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(verifyRes.statusCode).toBe(404);
  });
});
