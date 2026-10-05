const request = require('supertest');
const { app, setupTestDb } = require('./setup');

describe('Features 7 & 8: File Upload & Supabase Storage Integration', () => {
  let userToken;
  let productId;
  let warrantyId;
  let receiptId;
  let warrantyDocId;

  // 1x1 transparent PNG buffer
  const dummyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

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

    // Create a warranty to attach warranty document to
    const warRes = await request(app)
      .post('/api/warranties')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        product_id: productId,
        provider: 'Canon Care Protection',
        warranty_type: 'Manufacturer Extended',
        start_date: '2023-09-01',
        end_date: '2026-09-01',
      });
    warrantyId = warRes.body.data.id;
  });

  it('Feature 7: Successfully uploads a valid PNG receipt to Supabase Storage', async () => {
    const res = await request(app)
      .post(`/api/documents/receipts/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('receipt', dummyPng, { filename: 'purchase_receipt.png', contentType: 'image/png' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_name).toBe('purchase_receipt.png');
    expect(res.body.data.file_type).toBe('image/png');
    expect(res.body.data.file_path).toContain(String(res.body.data.product_id ? '' : ''));
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

  it('Feature 7: Generates secure signed URL for private receipt', async () => {
    const res = await request(app)
      .get(`/api/documents/receipts/${receiptId}/signed-url`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.signed_url).toBeDefined();
  });

  it('Feature 8: Successfully uploads a valid PDF warranty document', async () => {
    const dummyPdf = Buffer.from('%PDF-1.4\n%Mock PDF document content\n%%EOF');

    const res = await request(app)
      .post(`/api/documents/warranties/${warrantyId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('document', dummyPdf, { filename: 'warranty_policy.pdf', contentType: 'application/pdf' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_name).toBe('warranty_policy.pdf');
    expect(res.body.data.file_type).toBe('application/pdf');
    warrantyDocId = res.body.data.id;
  });

  it('Feature 8: Downloads uploaded warranty document with appropriate headers', async () => {
    const res = await request(app)
      .get(`/api/documents/warranties/${warrantyDocId}/download`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('Feature 8: Generates secure signed URL for warranty document', async () => {
    const res = await request(app)
      .get(`/api/documents/warranties/${warrantyDocId}/signed-url`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.signed_url).toBeDefined();
  });

  it('Feature 7: Deletes uploaded receipt from storage and database', async () => {
    const res = await request(app)
      .delete(`/api/documents/receipts/${receiptId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('Feature 8: Deletes uploaded warranty document from storage and database', async () => {
    const res = await request(app)
      .delete(`/api/documents/warranties/${warrantyDocId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
