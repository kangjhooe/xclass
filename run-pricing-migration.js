const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runPricingMigration() {
  console.log('========================================');
  console.log('  Migration: Pricing Update');
  console.log('  Billing Threshold & Pricing Lock');
  console.log('========================================');
  console.log('');

  // Database config - coba beberapa opsi
  let dbHost = process.env.DB_HOST || '127.0.0.1';
  if (dbHost === 'localhost') {
    dbHost = '127.0.0.1';
  }

  const dbConfigs = [
    { 
      host: dbHost, 
      port: parseInt(process.env.DB_PORT || '3306', 10), 
      user: process.env.DB_USERNAME || 'root', 
      password: process.env.DB_PASSWORD || '', 
      database: process.env.DB_DATABASE || 'xclass', 
      multipleStatements: true 
    },
    { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'xclass', multipleStatements: true },
    { host: 'localhost', port: 3306, user: 'root', password: '', database: 'xclass', multipleStatements: true },
  ];

  let connection;
  let dbConfig;
  
  try {
    console.log('[INFO] Menghubungkan ke database...');
    console.log(`[INFO] Host: ${dbHost}`);
    console.log(`[INFO] Database: ${process.env.DB_DATABASE || 'xclass'}`);
    console.log('');
    
    // Coba beberapa konfigurasi
    let connected = false;
    for (const config of dbConfigs) {
      try {
        connection = await mysql.createConnection(config);
        await connection.query('SELECT 1');
        dbConfig = config;
        connected = true;
        console.log('[SUCCESS] Terhubung ke database!');
        console.log('');
        break;
      } catch (err) {
        // Coba config berikutnya
        continue;
      }
    }
    
    if (!connected) {
      throw new Error('Tidak bisa terhubung ke database dengan semua konfigurasi yang dicoba');
    }

    // Baca file SQL
    const sqlFile = path.join(__dirname, 'database', 'sql', 'pricing_update_migration.sql');
    console.log(`[INFO] Membaca file: ${sqlFile}`);
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File tidak ditemukan: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('[INFO] Menjalankan migration...');
    console.log('');

    // Split SQL content into statements (handle IF NOT EXISTS and other complex statements)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.match(/^\/\*/));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 5) continue;
      
      try {
        // Handle ALTER TABLE with IF NOT EXISTS
        let sqlToExecute = statement;
        if (statement.includes('ADD COLUMN IF NOT EXISTS')) {
          // MySQL doesn't support IF NOT EXISTS in ALTER TABLE, so we need to check first
          const columnMatch = statement.match(/ADD COLUMN IF NOT EXISTS\s+`?(\w+)`?/i);
          if (columnMatch) {
            const columnName = columnMatch[1];
            const tableMatch = statement.match(/ALTER TABLE\s+`?(\w+)`?/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              // Check if column exists
              const [columns] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ? 
                AND COLUMN_NAME = ?
              `, [dbConfig.database, tableName, columnName]);
              
              if (columns.length > 0) {
                skipCount++;
                console.log(`[SKIP] Kolom '${columnName}' sudah ada di tabel '${tableName}'`);
                continue;
              } else {
                // Remove IF NOT EXISTS and execute
                sqlToExecute = statement.replace('IF NOT EXISTS', '');
              }
            }
          }
        }

        await connection.query(sqlToExecute + ';');
        successCount++;
        console.log(`[SUCCESS] Statement ${i + 1} berhasil`);
      } catch (error) {
        // Jika error karena sudah ada, itu normal
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_DUP_ENTRY' ||
            error.message.includes('already exists') ||
            error.message.includes('Duplicate') ||
            error.message.includes('Duplicate entry')) {
          skipCount++;
          console.log(`[SKIP] ${error.message.substring(0, 80)}...`);
        } else {
          errorCount++;
          const errorMsg = error.message.substring(0, 100);
          errors.push({ statement: i + 1, error: errorMsg });
          console.log(`[ERROR] Statement ${i + 1}: ${errorMsg}`);
        }
      }
    }

    console.log('');
    console.log('========================================');
    console.log('  Hasil Migration');
    console.log('========================================');
    console.log(`[SUCCESS] Berhasil: ${successCount}`);
    console.log(`[SKIP] Dilewati: ${skipCount}`);
    console.log(`[ERROR] Error: ${errorCount}`);
    console.log('');

    if (errors.length > 0) {
      console.log('[WARNING] Error details:');
      errors.forEach(err => {
        console.log(`  Statement ${err.statement}: ${err.error}`);
      });
      console.log('');
    }

    // Verifikasi
    console.log('[INFO] Memverifikasi migration...');
    console.log('');

    // Check locked_price_per_student column
    const [columns] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'tenant_subscriptions'
      AND COLUMN_NAME = 'locked_price_per_student'
    `, [dbConfig.database]);

    if (columns.length > 0) {
      console.log('[SUCCESS] Kolom locked_price_per_student berhasil ditambahkan:');
      console.table(columns);
      console.log('');
    } else {
      console.log('[WARNING] Kolom locked_price_per_student belum ditemukan.');
      console.log('');
    }

    // Check subscription plans
    const [plans] = await connection.query(`
      SELECT 
        id,
        name,
        slug,
        min_students,
        max_students,
        price_per_student_per_year,
        billing_threshold,
        is_free,
        is_active
      FROM subscription_plans
      WHERE slug IN ('free-forever', 'standard', 'enterprise')
      ORDER BY sort_order
    `);

    if (plans.length > 0) {
      console.log('[SUCCESS] Subscription Plans:');
      console.table(plans);
      console.log('');
    } else {
      console.log('[WARNING] Subscription plans belum ditemukan.');
      console.log('');
    }

    // Check existing subscriptions
    const [subscriptions] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN locked_price_per_student IS NOT NULL THEN 1 ELSE 0 END) as with_locked_price
      FROM tenant_subscriptions
      WHERE status = 'active'
    `);

    if (subscriptions.length > 0) {
      console.log('[INFO] Existing Subscriptions:');
      console.log(`  Total active: ${subscriptions[0].total}`);
      console.log(`  With locked price: ${subscriptions[0].with_locked_price}`);
      console.log('');
    }

    if (columns.length > 0 && plans.length >= 3) {
      console.log('[SUCCESS] Migration BERHASIL!');
      console.log('');
      console.log('✅ Kolom locked_price_per_student sudah ditambahkan');
      console.log('✅ Subscription plans sudah diupdate');
      console.log('');
    } else {
      console.log('[WARNING] Migration mungkin belum lengkap. Silakan cek error di atas.');
      console.log('');
    }

    console.log('[SUCCESS] Migration selesai!');
    console.log('');

  } catch (error) {
    console.error('[ERROR] Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('[INFO] MySQL service tidak berjalan!');
      console.error('[INFO] Buka XAMPP Control Panel dan start MySQL service.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('');
      console.error('[INFO] Akses ditolak. Cek kredensial database di file .env');
      console.error('[INFO] Atau jalankan via phpMyAdmin:');
      console.error('  1. Buka http://localhost/phpmyadmin');
      console.error('  2. Pilih database xclass');
      console.error('  3. Jalankan file: database/sql/pricing_update_migration.sql');
    } else {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runPricingMigration();

