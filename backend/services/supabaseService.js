const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

/**
 * Resolves standard Supabase project API URL from dashboard or API URL
 * e.g. https://supabase.com/dashboard/project/ifyrsivacshxygsgpfxq -> https://ifyrsivacshxygsgpfxq.supabase.co
 */
function getSupabaseEndpoint(rawUrl) {
  if (!rawUrl) return '';
  const match = rawUrl.match(/project\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://${match[1]}.supabase.co`;
  }
  return rawUrl.trim();
}

const rawUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = getSupabaseEndpoint(rawUrl);
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

const RECEIPTS_BUCKET = process.env.SUPABASE_RECEIPTS_BUCKET || 'receipts';
const WARRANTY_DOCS_BUCKET = process.env.SUPABASE_WARRANTY_DOCS_BUCKET || 'warranty-documents';

let supabaseClient = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err.message);
  }
}

// In-memory mock storage for isolated offline Jest test runs
const memoryStorage = new Map();

function isTestEnvironment() {
  return process.env.NODE_ENV === 'test' && process.env.SUPABASE_TEST_LIVE !== 'true';
}

/**
 * Normalizes storage path by stripping bucket name prefix if present
 */
function normalizePath(bucket, rawPath) {
  if (!rawPath) return '';
  const normalized = rawPath.replace(/\\/g, '/');
  if (normalized.startsWith(`${bucket}/`)) {
    return normalized.substring(bucket.length + 1);
  }
  return normalized;
}

/**
 * Generates a clean, unique file name
 */
function sanitizeFileName(originalName, prefix = 'doc') {
  const ext = path.extname(originalName || '').toLowerCase() || '.bin';
  const base = path.basename(originalName || '', ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 35);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  return `${prefix}-${base || 'file'}-${uniqueSuffix}${ext}`;
}

/**
 * Uploads a file buffer to Supabase Storage
 */
async function uploadFile(bucket, storagePath, fileBuffer, mimeType) {
  const cleanPath = normalizePath(bucket, storagePath);

  if (isTestEnvironment()) {
    memoryStorage.set(`${bucket}:${cleanPath}`, {
      buffer: fileBuffer,
      mimeType,
      size: fileBuffer.length,
      uploadedAt: new Date(),
    });
    return { path: cleanPath, bucket };
  }

  if (!supabaseClient) {
    throw new Error('Supabase client is not configured.');
  }

  // Normalize image/jpg to image/jpeg for bucket mime type compatibility
  const contentType = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(cleanPath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase Storage upload error: ${error.message}`);
  }

  return data;
}

/**
 * Downloads a file buffer from Supabase Storage
 */
async function downloadFile(bucket, storagePath) {
  const cleanPath = normalizePath(bucket, storagePath);

  if (isTestEnvironment()) {
    const item = memoryStorage.get(`${bucket}:${cleanPath}`);
    if (!item) {
      const err = new Error('Object not found in test storage');
      err.statusCode = 404;
      throw err;
    }
    return item.buffer;
  }

  if (!supabaseClient) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabaseClient.storage.from(bucket).download(cleanPath);

  if (error) {
    throw new Error(`Supabase Storage download error: ${error.message}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Creates a signed URL for secure, time-limited direct access to private files
 */
async function createSignedUrl(bucket, storagePath, expiresIn = 3600) {
  const cleanPath = normalizePath(bucket, storagePath);

  if (isTestEnvironment()) {
    return `https://mock.supabase.co/storage/v1/object/sign/${bucket}/${cleanPath}?token=mock_signed_token`;
  }

  if (!supabaseClient) {
    throw new Error('Supabase client is not configured.');
  }

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(cleanPath, expiresIn);

  if (error) {
    throw new Error(`Supabase Storage signed URL error: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Deletes a file from Supabase Storage
 */
async function deleteFile(bucket, storagePath) {
  const cleanPath = normalizePath(bucket, storagePath);

  if (isTestEnvironment()) {
    memoryStorage.delete(`${bucket}:${cleanPath}`);
    return { success: true };
  }

  if (!supabaseClient) {
    return { success: false, message: 'Supabase client not configured' };
  }

  const { data, error } = await supabaseClient.storage.from(bucket).remove([cleanPath]);

  if (error) {
    console.warn(`Supabase Storage delete warning: ${error.message}`);
  }

  return data;
}

module.exports = {
  RECEIPTS_BUCKET,
  WARRANTY_DOCS_BUCKET,
  uploadFile,
  downloadFile,
  createSignedUrl,
  deleteFile,
  sanitizeFileName,
  normalizePath,
  getClient: () => supabaseClient,
  isConfigured: () => !!supabaseClient,
};
