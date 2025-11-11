const mysql = require('mysql2/promise');

async function createXClassDatabase() {
  // Database config - adjust if needed
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  let connection;
  
  try {
    console.log('🔌 Menghubungkan ke MySQL server...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke MySQL server!\n');

    console.log('🔍 Membuat database "xclass"...\n');
    
    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS `xclass` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "xclass" berhasil dibuat atau sudah ada!');
    
    // Use database
    await connection.query('USE `xclass`');
    console.log('✅ Menggunakan database "xclass"\n');
    
    // Check existing tables
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('⚠️  Database "xclass" masih kosong (belum ada tabel).');
      console.log('💡 Pastikan untuk menjalankan migrasi database atau TypeORM sync.\n');
    } else {
      console.log(`✅ Database "xclass" sudah memiliki ${tables.length} tabel.\n`);
    }
    
    console.log('✅ Setup database "xclass" selesai!\n');
    console.log('💡 Jangan lupa update file .env dengan:');
    console.log('   DB_DATABASE=xclass\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Tidak bisa terhubung ke MySQL server.');
      console.error('💡 Pastikan MySQL/XAMPP sudah berjalan.\n');
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

createXClassDatabase();
