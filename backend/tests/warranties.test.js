const request = require('supertest');
const { app, setupTestDb } = require('./setup');
const { calculateWarrantyStatus } = require('../services/warrantyService');

describe('CRUD Area 2: Warranty Management, Status Calculation & Reminders', () => {
  let userToken;
  let productId;
  let warrantyId;

  beforeAll(async () => {
    const data = await setupTestDb();
    userToken = data.userToken;

    // Create a product to attach warranty to
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'ASUS ROG Zephyrus G14',
        brand: 'ASUS',
        purchase_date: '2024-02-01',
      });
    productId = prodRes.body.data.id;
  });

  describe('Feature 4: Automatic Warranty Status Calculation Unit Logic', () => {
    it('should calculate Active when remaining days > 30', () => {
      const future = new Date();
      future.setDate(future.getDate() + 90);
      const res = calculateWarrantyStatus(future.toISOString());
      expect(res.status).toBe('Active');
      expect(res.badgeColor).toBe('green');
      expect(res.isActive).toBe(true);
      expect(res.daysRemaining).toBeGreaterThan(30);
    });

    it('should calculate Expiring Soon when remaining days 0-30', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 15);
      const res = calculateWarrantyStatus(soon.toISOString());
      expect(res.status).toBe('Expiring Soon');
      expect(res.badgeColor).toBe('amber');
      expect(res.isExpiringSoon).toBe(true);
      expect(res.daysRemaining).toBeLessThanOrEqual(30);
      expect(res.daysRemaining).toBeGreaterThanOrEqual(0);
    });

    it('should calculate Expired when date has passed', () => {
      const past = new Date();
      past.setDate(past.getDate() - 10);
      const res = calculateWarrantyStatus(past.toISOString());
      expect(res.status).toBe('Expired');
      expect(res.badgeColor).toBe('red');
      expect(res.isExpired).toBe(true);
      expect(res.daysRemaining).toBeLessThan(0);
    });
  });

  describe('Warranty CRUD Endpoints', () => {
    it('Feature 2: Creates a warranty (Create)', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 180);

      const res = await request(app)
        .post('/api/warranties')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          product_id: productId,
          provider: 'ASUS Care Protection',
          warranty_type: 'Manufacturer Extended',
          start_date: '2024-02-01',
          end_date: futureDate.toISOString().split('T')[0],
          coverage_details: 'Covers thermal issues, screen replacement, and hardware diagnostics.',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provider).toBe('ASUS Care Protection');
      expect(res.body.data.status).toBe('Active');
      warrantyId = res.body.data.id;
    });

    it('Feature 2: Reads warranties list (Read)', async () => {
      const res = await request(app)
        .get('/api/warranties')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Feature 2: Reads single warranty details (Read Details)', async () => {
      const res = await request(app)
        .get(`/api/warranties/${warrantyId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(warrantyId);
      expect(res.body.data.days_remaining).toBeDefined();
    });

    it('Feature 2: Updates warranty information (Update)', async () => {
      const res = await request(app)
        .put(`/api/warranties/${warrantyId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          provider: 'ASUS Premium Care Global',
          coverage_details: 'Updated with accidental damage protection.',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.provider).toBe('ASUS Premium Care Global');
    });

    it('Feature 10: Sends automated warranty reminder email', async () => {
      const res = await request(app)
        .post(`/api/warranties/${warrantyId}/send-reminder`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'student.test@warrantyapp.com',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Warranty reminder email sent');
    });

    it('Feature 2: Deletes warranty record (Delete)', async () => {
      const res = await request(app)
        .delete(`/api/warranties/${warrantyId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
