const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('========================================');
  console.log('  Migration: Add copy_question_banks Column');
  console.log('========================================');
  console.log('');

  // Database config - coba beberapa opsi (prioritaskan 'class' sesuai .env)
  const dbConfigs = [
    { host: 'localhost', port: 3306, user: 'root', password: '', database: 'class', multipleStatements: true },
    { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'class', multipleStatements: true },
    { host: 'localhost', port: 3306, user: 'root', password: '', database: 'xclass', multipleStatements: true },
    { host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'xclass', multipleStatements: true },
    { socketPath: '\\\\.\\pipe\\MySQL', user: 'root', password: '', database: 'class', multipleStatements: true },
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
        console.log(`[SUCCESS] Terhubung ke database: ${config.database}@${config.host || config.socketPath}`);
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
    const sqlFile = path.join(__dirname, 'database', 'sql', 'add_copy_question_banks_to_teacher_branch.sql');
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
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT') && !s.startsWith('SHOW') && !s.startsWith('DESCRIBE'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[INFO] Menjalankan statement ${i + 1}/${statements.length}...`);
        await connection.query(statement);
        console.log(`[SUCCESS] Statement ${i + 1} berhasil dijalankan`);
      } catch (err) {
        // Jika error karena kolom sudah ada, skip
        if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('Duplicate column name')) {
          console.log(`[WARNING] Kolom sudah ada, melewati...`);
          continue;
        }
        throw err;
      }
    }

    // Verifikasi
    console.log('');
    console.log('[INFO] Memverifikasi migration...');
    const [rows] = await connection.query(
      "SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'teacher_branch_requests' AND COLUMN_NAME = 'copy_question_banks'",
      [dbConfig.database]
    );

    if (rows.length > 0) {
      console.log('[SUCCESS] ✅ Kolom copy_question_banks berhasil ditambahkan!');
      console.log('');
      console.log('Detail kolom:');
      console.log(`  - Nama: ${rows[0].COLUMN_NAME}`);
      console.log(`  - Type: ${rows[0].COLUMN_TYPE}`);
      console.log(`  - Default: ${rows[0].COLUMN_DEFAULT}`);
      console.log(`  - Nullable: ${rows[0].IS_NULLABLE}`);
    } else {
      console.log('[WARNING] Kolom tidak ditemukan setelah migration. Mungkin sudah ada sebelumnya.');
    }

    console.log('');
    console.log('========================================');
    console.log('  Migration Selesai!');
    console.log('========================================');

  } catch (error) {
    console.error('');
    console.error('[ERROR] Migration gagal!');
    console.error('');
    console.error('Error details:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    if (error.sql) {
      console.error(`SQL: ${error.sql}`);
    }
    console.error('');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('');
      console.log('[INFO] Koneksi database ditutup');
    }
  }
}

// Jalankan migration
runMigration().catch(console.error);

