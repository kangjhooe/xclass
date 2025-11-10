const mysql = require('mysql2/promise');

async function createDatabase() {
  // Connect without specifying database
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
  });

  try {
    console.log('🔍 Membuat database "class"...\n');
    
    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS `class` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "class" berhasil dibuat atau sudah ada!');
    
    // Use database
    await connection.query('USE `class`');
    console.log('✅ Menggunakan database "class"\n');
    
    // Check if users table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('⚠️  Tabel "users" belum ada.');
      console.log('💡 Pastikan untuk menjalankan migrasi database atau TypeORM sync.\n');
    } else {
      console.log('✅ Tabel "users" sudah ada.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await connection.end();
  }
}

createDatabase();

