const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_FILE_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10)) * 1024 * 1024; // 5MB

// Ensure directories exist
const receiptsDir = path.join(__dirname, '..', 'uploads', 'receipts');
const warrantiesDir = path.join(__dirname, '..', 'uploads', 'warranties');

if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true });
if (!fs.existsSync(warrantiesDir)) fs.mkdirSync(warrantiesDir, { recursive: true });

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIME_TYPES.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.'
      ),
      false
    );
  }
};

// Storage configuration for Receipts
const receiptStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, receiptsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `receipt-${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// Storage configuration for Warranty Documents
const warrantyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, warrantiesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `warranty-doc-${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

const uploadReceipt = multer({
  storage: receiptStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

const uploadWarrantyDoc = multer({
  storage: warrantyStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// Error handling wrapper for Multer
function handleMulterError(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE_MB || 5}MB.`,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
}

module.exports = {
  uploadReceipt: handleMulterError(uploadReceipt.single('receipt')),
  uploadWarrantyDoc: handleMulterError(uploadWarrantyDoc.single('document')),
};
