const request = require('supertest');
const { app, setupTestDb } = require('./setup');

describe('CRUD Area 3: Service & Repair Management', () => {
  let userToken;
  let productId;
  let serviceId;

  beforeAll(async () => {
    const data = await setupTestDb();
    userToken = data.userToken;

    // Create a product to attach service record to
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'iPad Pro 11 M2',
        brand: 'Apple',
        purchase_date: '2023-08-15',
      });
    productId = prodRes.body.data.id;
  });

  it('Feature 3: Creates a service/repair record (Create)', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        product_id: productId,
        service_date: '2024-03-10',
        service_center: 'Apple Authorized Service Provider',
        description: 'Screen inspection and USB port calibration.',
        cost: 85.50,
        notes: 'Routine service checkup.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service_center).toBe('Apple Authorized Service Provider');
    serviceId = res.body.data.id;
  });

  it('Validation: Rejects service record creation with missing fields', async () => {
    const res = await request(app)
      .post('/api/services')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        product_id: productId,
        service_center: '',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('Feature 3: Reads service records list (Read)', async () => {
    const res = await request(app)
      .get('/api/services')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('Feature 3: Reads single service record (Read Details)', async () => {
    const res = await request(app)
      .get(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(serviceId);
  });

  it('Feature 3: Updates a service record (Update)', async () => {
    const res = await request(app)
      .put(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        cost: 75.00,
        notes: 'Discount applied on service fee.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(parseFloat(res.body.data.cost)).toBe(75.00);
  });

  it('Feature 3: Deletes a service record (Delete)', async () => {
    const res = await request(app)
      .delete(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const checkRes = await request(app)
      .get(`/api/services/${serviceId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(checkRes.statusCode).toBe(404);
  });
});
