const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  try {
    await db.initializeDb();
    console.log('--- Initializing & Seeding Database ---');

    // Run schema if connected to real PostgreSQL
    if (!db.isInMemory()) {
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await db.query(schemaSql);
      console.log(' Applied schema.sql successfully.');
    }

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    // Insert Admin user if not exists
    const adminRes = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id, name, email, role`,
      ['System Administrator', 'admin@warranty.com', adminPassword, 'admin']
    );
    const adminUser = adminRes.rows[0];
    console.log(` Admin user created: ${adminUser.email}`);

    // Insert Normal user if not exists
    const userRes = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
       RETURNING id, name, email, role`,
      ['Alex Johnson', 'user@warranty.com', userPassword, 'user']
    );
    const normalUser = userRes.rows[0];
    console.log(` Normal user created: ${normalUser.email}`);

    // Insert Categories
    const categories = [
      ['Laptops & Computers', 'Laptops, desktop PCs, monitors, and computing accessories'],
      ['Smartphones & Tablets', 'Mobile phones, tablets, smartwatches, and accessories'],
      ['Home Appliances', 'Refrigerators, washing machines, microwaves, and vacuums'],
      ['Audio & Entertainment', 'Headphones, soundbars, televisions, and gaming consoles'],
      ['Office Equipment', 'Printers, scanners, projectors, and office machinery'],
    ];

    const categoryMap = {};
    for (const [name, desc] of categories) {
      const catRes = await db.query(
        `INSERT INTO categories (name, description)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [name, desc]
      );
      categoryMap[name] = catRes.rows[0].id;
    }
    console.log(` Categories seeded: ${Object.keys(categoryMap).length}`);

    // Check if products already exist for normal user
    const existingProducts = await db.query('SELECT id FROM products WHERE user_id = $1', [normalUser.id]);
    if (existingProducts.rows.length === 0) {
      // 1. Dell XPS 15 (Active Warranty - expires in ~240 days)
      const p1 = await db.query(
        `INSERT INTO products (user_id, category_id, name, brand, model, serial_number, purchase_date, purchase_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          normalUser.id,
          categoryMap['Laptops & Computers'],
          'Dell XPS 15 9520',
          'Dell',
          'XPS 9520 OLED',
          'DL-XPS-984712',
          '2024-01-15',
          1899.99,
          'Primary work laptop with 4K OLED display and 32GB RAM.'
        ]
      );

      // Dell Warranty: Active (>30 days remaining)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 240);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      await db.query(
        `INSERT INTO warranties (product_id, provider, warranty_type, start_date, end_date, coverage_details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p1.rows[0].id,
          'Dell Premium Support Plus',
          'Manufacturer Extended',
          '2024-01-15',
          futureDateStr,
          'Covers hardware repairs, accidental damage, onsite technician, and 24/7 priority phone support.'
        ]
      );

      // 2. Sony WH-1000XM4 (Expiring Soon - expires in ~14 days)
      const p2 = await db.query(
        `INSERT INTO products (user_id, category_id, name, brand, model, serial_number, purchase_date, purchase_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          normalUser.id,
          categoryMap['Audio & Entertainment'],
          'Sony Noise Cancelling Headphones',
          'Sony',
          'WH-1000XM4',
          'SN-XM4-331098',
          '2023-10-10',
          348.00,
          'Wireless noise cancelling headphones used for travel and study.'
        ]
      );

      // Sony Warranty: Expiring Soon (14 days remaining)
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 14);
      const soonDateStr = soonDate.toISOString().split('T')[0];

      await db.query(
        `INSERT INTO warranties (product_id, provider, warranty_type, start_date, end_date, coverage_details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p2.rows[0].id,
          'Sony Electronics Service',
          'Manufacturer Standard',
          '2023-10-10',
          soonDateStr,
          'Covers battery degradation below 60%, internal speaker driver failures, and Bluetooth connectivity issues.'
        ]
      );

      // Service record for Sony headphones
      await db.query(
        `INSERT INTO service_records (product_id, service_date, service_center, description, cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p2.rows[0].id,
          '2024-04-12',
          'Sony Authorized Service Center Downtown',
          'Firmware recalibration and ear cushion replacement under care checkup.',
          0.00,
          'Complimentary service under standard warranty coverage.'
        ]
      );

      // 3. Samsung Galaxy S21 (Expired - expired 120 days ago)
      const p3 = await db.query(
        `INSERT INTO products (user_id, category_id, name, brand, model, serial_number, purchase_date, purchase_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          normalUser.id,
          categoryMap['Smartphones & Tablets'],
          'Samsung Galaxy S21 Ultra',
          'Samsung',
          'SM-G998B',
          'SM-998-00214',
          '2022-03-20',
          1199.00,
          'Personal smartphone with 256GB storage.'
        ]
      );

      // Samsung Warranty: Expired
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 120);
      const pastDateStr = pastDate.toISOString().split('T')[0];

      await db.query(
        `INSERT INTO warranties (product_id, provider, warranty_type, start_date, end_date, coverage_details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p3.rows[0].id,
          'Samsung Care',
          'Manufacturer Limited',
          '2022-03-20',
          pastDateStr,
          'Standard 1-year manufacturer warranty for defects in material and workmanship.'
        ]
      );

      // Service record for Samsung
      await db.query(
        `INSERT INTO service_records (product_id, service_date, service_center, description, cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p3.rows[0].id,
          '2023-01-05',
          'Samsung Experience Store Repair Desk',
          'USB-C charging port cleaning and battery health diagnostic.',
          45.00,
          'Post-warranty repair cost paid by user.'
        ]
      );

      // 4. LG Smart Inverter Refrigerator
      const p4 = await db.query(
        `INSERT INTO products (user_id, category_id, name, brand, model, serial_number, purchase_date, purchase_price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          normalUser.id,
          categoryMap['Home Appliances'],
          'LG Smart Inverter 4-Door Refrigerator',
          'LG',
          'GR-X29FTQKL',
          'LG-REF-77123',
          '2023-06-15',
          2250.00,
          'Kitchen refrigerator with Door-in-Door and linear compressor.'
        ]
      );

      const refDate = new Date();
      refDate.setDate(refDate.getDate() + 365);
      await db.query(
        `INSERT INTO warranties (product_id, provider, warranty_type, start_date, end_date, coverage_details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          p4.rows[0].id,
          'LG Electronics Care',
          'Compressor 10-Year Warranty',
          '2023-06-15',
          refDate.toISOString().split('T')[0],
          'Full 10-year parts warranty on smart inverter linear compressor.'
        ]
      );

      console.log(' Sample products, warranties, and service records seeded successfully.');
    }

    console.log(' Database initialization & seeding complete.');
    return { success: true };
  } catch (error) {
    console.error('Error during database initialization/seeding:', error);
    throw error;
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
