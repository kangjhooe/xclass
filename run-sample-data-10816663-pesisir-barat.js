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
    const sqlPath = path.join(__dirname, 'database', 'sql', 'sample_students_10816663_pesisir_barat.sql');
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
      [10816663]
    );
    console.log(`✅ Jumlah siswa untuk tenant 10816663: ${students[0].count}`);
    
    // Check students from Pesisir Barat
    const [pbStudents] = await connection.query(
      'SELECT COUNT(*) as count FROM students WHERE instansiId = ? AND district = ?',
      [10816663, 'Pesisir Barat']
    );
    console.log(`✅ Jumlah siswa dari Pesisir Barat: ${pbStudents[0].count}\n`);
    
    // Show sample students
    const [studentList] = await connection.query(
      'SELECT name, studentNumber, nisn, birthPlace, district, city FROM students WHERE instansiId = ? AND district = ? LIMIT 5',
      [10816663, 'Pesisir Barat']
    );
    
    if (studentList.length > 0) {
      console.log('📋 Daftar siswa yang diinsert (Pesisir Barat):');
      console.table(studentList);
    } else {
      console.log('⚠️  Tidak ada siswa yang ditemukan.');
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

