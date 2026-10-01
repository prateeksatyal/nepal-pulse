const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const db = require('./config/db');
const { seedDatabase } = require('./database/initDb');

// Load environment variables
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const warrantyRoutes = require('./routes/warrantyRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically for direct preview if authenticated or authorized
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: db.isInMemory() ? 'in-memory (pg-mem)' : 'PostgreSQL live',
    service: 'Warranty Management System API',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api', adminRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto-initialize database on server startup
async function startServer() {
  try {
    await db.initializeDb();
    await seedDatabase();
    
    if (process.env.NODE_ENV !== 'test') {
      const server = app.listen(PORT, () => {
        console.log(`===============================================`);
        console.log(`🚀 Warranty Management Server running on port ${PORT}`);
        console.log(`📊 Mode: ${process.env.NODE_ENV || 'development'}`);
        console.log(`💾 Database: ${db.isInMemory() ? 'In-Memory PostgreSQL' : 'Live PostgreSQL'}`);
        console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
        console.log(`===============================================`);
      });
      return server;
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
