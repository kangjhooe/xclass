
const mysql = require('mysql2/promise');

async function verify() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'xclass',
    });

    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'xclass'
      AND TABLE_NAME = 'students'
      AND COLUMN_NAME IN ('academic_level', 'current_grade', 'academic_year')
    `);

    if (columns.length >= 3) {
      console.log('[SUCCESS] Migration BERHASIL!');
      console.log('Kolom yang ditemukan:');
      columns.forEach(col => {
        console.log('  -', col.COLUMN_NAME, '(' + col.DATA_TYPE + ')');
      });
      process.exit(0);
    } else {
      console.log('[WARNING] Kolom belum lengkap. Jumlah:', columns.length);
      console.log('[INFO] Silakan jalankan migration via phpMyAdmin');
      process.exit(1);
    }

    await connection.end();
  } catch (error) {
    console.log('[INFO] Tidak bisa verifikasi via script');
    console.log('[INFO] Silakan verifikasi manual via phpMyAdmin:');
    console.log('  DESCRIBE students;');
    process.exit(1);
  }
}

verify();
