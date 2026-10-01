const request = require('supertest');
const { app, setupTestDb } = require('./setup');

describe('Features 7 & 8: File Upload & Validation', () => {
  let userToken;
  let productId;
  let receiptId;

  beforeAll(async () => {
    const data = await setupTestDb();
    userToken = data.userToken;

    // Create a product to attach receipt to
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Canon EOS R6 Camera',
        brand: 'Canon',
        purchase_date: '2023-09-01',
      });
    productId = prodRes.body.data.id;
  });

  it('Feature 7: Successfully uploads a valid PNG receipt', async () => {
    // 1x1 transparent PNG buffer
    const dummyPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post(`/api/documents/receipts/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('receipt', dummyPng, { filename: 'purchase_receipt.png', contentType: 'image/png' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_name).toBe('purchase_receipt.png');
    expect(res.body.data.file_type).toBe('image/png');
    receiptId = res.body.data.id;
  });

  it('Feature 7: Rejects invalid file type (.txt)', async () => {
    const textBuffer = Buffer.from('This is a plain text file, not an allowed image or PDF.');

    const res = await request(app)
      .post(`/api/documents/receipts/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('receipt', textBuffer, { filename: 'receipt.txt', contentType: 'text/plain' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid file type');
  });

  it('Feature 7: Downloads uploaded receipt with appropriate headers', async () => {
    const res = await request(app)
      .get(`/api/documents/receipts/${receiptId}/download`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
  });

  it('Feature 7: Deletes uploaded receipt', async () => {
    const res = await request(app)
      .delete(`/api/documents/receipts/${receiptId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
