const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Load .env manually if dotenv is not available
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

async function runMigration() {
  // Read database config from .env or use defaults
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
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
    const migrationPath = path.join(__dirname, 'database', 'sql', 'add_student_academic_tracking.sql');
    console.log(`📄 Membaca file migration: ${migrationPath}\n`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`File migration tidak ditemukan: ${migrationPath}`);
    }

    let migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Replace MySQL incompatible syntax
    // MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
    // We'll check and add columns conditionally
    console.log('🔍 Memeriksa kolom yang sudah ada...\n');
    
    const [existingColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'students'
      AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year')
    `, [dbConfig.database]);
    
    const existingColumnNames = existingColumns.map(col => col.COLUMN_NAME);
    console.log(`📋 Kolom yang sudah ada: ${existingColumnNames.length > 0 ? existingColumnNames.join(', ') : 'Tidak ada'}\n`);

    // Remove IF NOT EXISTS from ALTER TABLE statements
    migrationSQL = migrationSQL.replace(/ADD COLUMN IF NOT EXISTS/g, 'ADD COLUMN');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    console.log('🚀 Menjalankan migration...\n');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip ALTER TABLE if column already exists
      if (statement.includes('ALTER TABLE students') && statement.includes('ADD COLUMN')) {
        if (statement.includes('academic_level') && existingColumnNames.includes('academic_level')) {
          console.log(`⏭️  Melewati: academic_level sudah ada`);
          continue;
        }
        if (statement.includes('current_grade') && existingColumnNames.includes('current_grade')) {
          console.log(`⏭️  Melewati: current_grade sudah ada`);
          continue;
        }
        if (statement.includes('academic_year') && existingColumnNames.includes('academic_year')) {
          console.log(`⏭️  Melewati: academic_year sudah ada`);
          continue;
        }
      }
      
      // Skip CREATE INDEX IF NOT EXISTS if index might exist
      if (statement.includes('CREATE INDEX IF NOT EXISTS')) {
        try {
          await connection.query(statement.replace('IF NOT EXISTS', ''));
          console.log(`✅ ${statement.substring(0, 50)}...`);
        } catch (error) {
          if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`⏭️  Index sudah ada, melewati...`);
          } else {
            throw error;
          }
        }
        continue;
      }
      
      // Skip CREATE OR REPLACE VIEW if view exists
      if (statement.includes('CREATE OR REPLACE VIEW')) {
        try {
          await connection.query(statement);
          console.log(`✅ View berhasil dibuat/diupdate`);
        } catch (error) {
          console.error(`❌ Error membuat view: ${error.message}`);
        }
        continue;
      }
      
      // Skip DELIMITER and stored procedure creation for now (handle separately)
      if (statement.includes('DELIMITER') || statement.includes('CREATE PROCEDURE')) {
        console.log(`⏭️  Melewati stored procedure (dapat dibuat manual jika diperlukan)`);
        continue;
      }
      
      // Execute other statements
      if (statement.length > 10) { // Skip very short statements
        try {
          await connection.query(statement);
          if (statement.includes('ALTER TABLE') || statement.includes('CREATE INDEX')) {
            console.log(`✅ ${statement.substring(0, 60)}...`);
          }
        } catch (error) {
          // Ignore "column already exists" errors
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⏭️  Kolom sudah ada, melewati...`);
          } else if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`⏭️  Index sudah ada, melewati...`);
          } else {
            console.error(`❌ Error: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
          }
        }
      }
    }
    
    console.log('\n✅ Migration berhasil dijalankan!\n');
    
    // Verify columns
    console.log('🔍 Memverifikasi kolom yang ditambahkan...\n');
    const [columns] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      AND TABLE_NAME = 'students'
      AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year')
    `, [dbConfig.database]);
    
    if (columns.length > 0) {
      console.log('📋 Kolom yang berhasil ditambahkan:');
      console.table(columns);
    } else {
      console.log('⚠️  Kolom tidak ditemukan setelah migration');
    }
    
    // Verify indexes
    console.log('\n🔍 Memverifikasi index...\n');
    const [indexes] = await connection.query(`
      SHOW INDEX FROM students 
      WHERE Key_name LIKE 'idx_students%'
    `);
    
    if (indexes.length > 0) {
      console.log('📋 Index yang berhasil dibuat:');
      const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];
      console.table(uniqueIndexes.map(name => ({ 'Index Name': name })));
    }
    
    // Verify view
    console.log('\n🔍 Memverifikasi view...\n');
    try {
      const [views] = await connection.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.VIEWS 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'v_student_lifetime_summary'
      `, [dbConfig.database]);
      
      if (views.length > 0) {
        console.log('✅ View `v_student_lifetime_summary` berhasil dibuat!\n');
      }
    } catch (error) {
      console.log('⚠️  View belum dibuat atau ada error\n');
    }
    
    console.log('✅ Migration selesai!\n');
    
  } catch (error) {
    console.error('❌ Error menjalankan migration:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Tidak bisa terhubung ke database.');
      console.error('💡 Pastikan MySQL/XAMPP sudah berjalan dan konfigurasi database benar.\n');
    } else {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Koneksi database ditutup.\n');
    }
  }
}

runMigration();

