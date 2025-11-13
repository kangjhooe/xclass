const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  // Read database config from .env or use defaults
  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'xclass',
    multipleStatements: true,
  };

  let connection;
  
  try {
    console.log('🔌 Menghubungkan ke database...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database!\n');

    // Read migration file
    const migrationPath = path.join(__dirname, 'database', 'sql', 'teacher_branch_migration.sql');
    console.log(`📄 Membaca file migration: ${migrationPath}\n`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`File migration tidak ditemukan: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Menjalankan migration...\n');
    await connection.query(migrationSQL);
    
    console.log('✅ Migration berhasil dijalankan!\n');
    
    // Verify teacher_branch_requests table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'teacher_branch_requests'"
    );
    
    if (tables.length > 0) {
      console.log('✅ Tabel `teacher_branch_requests` berhasil dibuat!\n');
      
      // Show table structure
      const [columns] = await connection.query(
        "DESCRIBE `teacher_branch_requests`"
      );
      
      console.log('📋 Struktur tabel teacher_branch_requests:');
      console.table(columns);
    } else {
      console.log('⚠️  Tabel teacher_branch_requests tidak ditemukan setelah migration');
    }

    // Verify isMainTenant column exists
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM `teachers` LIKE 'isMainTenant'"
    );
    
    if (columns.length > 0) {
      console.log('\n✅ Kolom `isMainTenant` berhasil ditambahkan ke tabel `teachers`!\n');
      
      // Show column details
      const [columnDetails] = await connection.query(
        "SHOW COLUMNS FROM `teachers` WHERE Field = 'isMainTenant'"
      );
      
      console.log('📋 Detail kolom isMainTenant:');
      console.table(columnDetails);
    } else {
      console.log('\n⚠️  Kolom isMainTenant tidak ditemukan setelah migration');
    }
    
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

// Load .env if exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
  }
} catch (error) {
  console.log('⚠️  Tidak dapat membaca file .env, menggunakan default values');
}

runMigration();

