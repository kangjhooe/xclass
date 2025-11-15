const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    // Database connection config
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'xclass',
      multipleStatements: true,
    };

    console.log('🔌 Menghubungkan ke database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Terhubung ke database!\n');

    // Read migration SQL file
    const sqlFilePath = path.join(__dirname, 'database', 'sql', 'add_teacher_detail_fields.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`File migration tidak ditemukan: ${sqlFilePath}`);
    }

    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📝 Menjalankan migration untuk menambahkan field detail guru...\n');
    
    // Execute migration
    await connection.query(sql);
    
    console.log('✅ Migration berhasil dijalankan!\n');
    
    // Verify some key columns
    console.log('🔍 Memverifikasi kolom yang ditambahkan...\n');
    
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'teachers' 
       AND COLUMN_NAME IN (
         'page_id', 'npk', 'mother_name', 'province', 'city_district',
         'education_level', 'employment_status', 'base_salary',
         'certification_participation_status', 'tpg_amount',
         'has_received_award', 'personality_competency'
       )
       ORDER BY COLUMN_NAME`,
      [config.database]
    );
    
    if (columns.length > 0) {
      console.log('📋 Kolom yang berhasil ditambahkan:');
      console.table(columns);
    } else {
      console.log('⚠️  Tidak ada kolom yang ditemukan (mungkin sudah ada sebelumnya)');
    }
    
    // Count total columns
    const [totalColumns] = await connection.query(
      `SELECT COUNT(*) as total 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'teachers'`,
      [config.database]
    );
    
    console.log(`\n📊 Total kolom di tabel teachers: ${totalColumns[0].total}`);
    console.log('\n✅ Migration selesai dengan sukses!');
    
  } catch (error) {
    console.error('❌ Error saat menjalankan migration:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Koneksi database ditutup.');
    }
  }
}

// Run migration
runMigration();

