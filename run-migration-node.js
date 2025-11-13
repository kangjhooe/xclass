const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('========================================');
  console.log('  Migration: Academic Tracking');
  console.log('========================================');
  console.log('');

  // Database config - coba beberapa opsi
  const dbConfigs = [
    { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'xclass', multipleStatements: true },
    { host: 'localhost', port: 3306, user: 'root', password: '', database: 'xclass', multipleStatements: true },
    { socketPath: '\\\\.\\pipe\\MySQL', user: 'root', password: '', database: 'xclass', multipleStatements: true },
  ];

  let connection;
  let dbConfig;
  
  try {
    console.log('[INFO] Menghubungkan ke database...');
    
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
    const sqlFile = path.join(__dirname, 'database', 'sql', 'add_student_academic_tracking_simple.sql');
    console.log(`[INFO] Membaca file: ${sqlFile}`);
    
    if (!fs.existsSync(sqlFile)) {
      throw new Error(`File tidak ditemukan: ${sqlFile}`);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('[INFO] Menjalankan migration...');
    console.log('');

    // Split SQL content into statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.length < 5) continue;
      
      try {
        await connection.query(statement + ';');
        successCount++;
        console.log(`[SUCCESS] Statement berhasil`);
      } catch (error) {
        // Jika error karena sudah ada, itu normal
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.message.includes('already exists') ||
            error.message.includes('Duplicate')) {
          skipCount++;
          console.log(`[SKIP] Sudah ada: ${error.message.substring(0, 50)}...`);
        } else {
          errorCount++;
          console.log(`[ERROR] ${error.message.substring(0, 100)}`);
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

    // Verifikasi
    console.log('[INFO] Memverifikasi migration...');
    console.log('');

    const [columns] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'xclass'
      AND TABLE_NAME = 'students'
      AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year')
    `);

    if (columns.length > 0) {
      console.log('[SUCCESS] Kolom yang berhasil ditambahkan:');
      console.table(columns);
      console.log('');

      if (columns.length >= 3) {
        console.log('[SUCCESS] Migration BERHASIL! Semua kolom sudah ditambahkan.');
        console.log('');
        console.log('Kolom yang ditemukan:');
        columns.forEach(col => {
          console.log(`  - ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
        });
      } else {
        console.log(`[WARNING] Hanya ${columns.length} dari 3 kolom yang ditemukan.`);
      }
    } else {
      console.log('[WARNING] Kolom belum ditemukan. Migration mungkin belum berhasil.');
    }

    console.log('');
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
      console.error('[INFO] Akses ditolak. Coba jalankan via phpMyAdmin:');
      console.error('  1. Buka http://localhost/phpmyadmin');
      console.error('  2. Pilih database xclass');
      console.error('  3. Jalankan file: database/sql/add_student_academic_tracking_simple.sql');
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

runMigration();

