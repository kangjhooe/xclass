const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSampleData() {
  // Read database config from .env or use defaults
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'class',
    multipleStatements: true,
  };

  let connection;
  
  try {
    console.log('🔌 Menghubungkan ke database...\n');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Terhubung ke database!\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'database', 'sql', 'sample_data_10648387.sql');
    console.log(`📄 Membaca file SQL: ${sqlPath}\n`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File SQL tidak ditemukan: ${sqlPath}`);
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🚀 Menjalankan SQL...\n');
    await connection.query(sqlContent);
    
    console.log('✅ Data berhasil diinsert!\n');
    
    // Verify data
    console.log('🔍 Memverifikasi data...\n');
    
    // Check students
    const [students] = await connection.query(
      'SELECT COUNT(*) as count FROM students WHERE instansiId = ?',
      [10648387]
    );
    console.log(`✅ Jumlah siswa untuk tenant 10648387: ${students[0].count}`);
    
    // Check teachers
    const [teachers] = await connection.query(
      'SELECT COUNT(*) as count FROM teachers WHERE instansiId = ?',
      [10648387]
    );
    console.log(`✅ Jumlah guru untuk tenant 10648387: ${teachers[0].count}\n`);
    
    // Show sample students
    const [studentList] = await connection.query(
      'SELECT name, studentNumber, nisn, birthPlace FROM students WHERE instansiId = ? LIMIT 5',
      [10648387]
    );
    
    if (studentList.length > 0) {
      console.log('📋 Daftar siswa yang diinsert:');
      console.table(studentList);
    }
    
    // Show sample teachers
    const [teacherList] = await connection.query(
      'SELECT name, employeeNumber, specialization FROM teachers WHERE instansiId = ? LIMIT 5',
      [10648387]
    );
    
    if (teacherList.length > 0) {
      console.log('📋 Daftar guru yang diinsert:');
      console.table(teacherList);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Tidak bisa terhubung ke MySQL server.');
      console.error('💡 Pastikan MySQL/XAMPP sudah berjalan.\n');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('⚠️  Tabel tidak ditemukan.');
      console.error('💡 Pastikan database sudah di-setup dengan benar.\n');
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

runSampleData();

