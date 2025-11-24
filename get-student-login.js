const mysql = require('mysql2/promise');

async function getStudentLogin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'class'
  });

  try {
    // Cari tenant dengan NPSN 10816663
    const [tenants] = await connection.query(
      'SELECT id, npsn, name FROM tenants WHERE npsn = ?',
      ['10816663']
    );

    if (tenants.length === 0) {
      console.log('❌ Tenant dengan NPSN 10816663 tidak ditemukan!');
      return;
    }

    const tenant = tenants[0];
    console.log(`\n✅ Tenant ditemukan: ${tenant.name} (ID: ${tenant.id}, NPSN: ${tenant.npsn})\n`);

    // Ambil data siswa
    const [students] = await connection.query(
      `SELECT id, name, nik, nisn, studentNumber, email, instansiId 
       FROM students 
       WHERE instansiId = ? AND isActive = 1 
       ORDER BY nik 
       LIMIT 20`,
      [tenant.id]
    );

    if (students.length === 0) {
      console.log('❌ Tidak ada siswa aktif untuk tenant ini!');
      return;
    }

    console.log('='.repeat(80));
    console.log('DATA LOGIN SISWA - TENANT 10816663');
    console.log('='.repeat(80));
    console.log(`\nLink Login: http://localhost:3000/login (atau sesuai URL aplikasi Anda)\n`);
    console.log('Cara Login:');
    console.log('1. Pilih "NIK (Siswa/Guru)" pada halaman login');
    console.log('2. Masukkan NIK (16 digit)');
    console.log('3. Masukkan Password (default: NIK itu sendiri untuk login pertama kali)\n');
    console.log('='.repeat(80));
    console.log('\nDaftar Siswa:\n');

    students.forEach((student, index) => {
      console.log(`${index + 1}. ${student.name}`);
      console.log(`   NIK: ${student.nik || 'Tidak ada'}`);
      console.log(`   Password Default: ${student.nik || 'Tidak ada'} (sama dengan NIK)`);
      console.log(`   NISN: ${student.nisn || 'Tidak ada'}`);
      console.log(`   Email: ${student.email || 'Tidak ada'}`);
      console.log(`   NIS: ${student.studentNumber || 'Tidak ada'}`);
      console.log('');
    });

    console.log('='.repeat(80));
    console.log(`\nTotal: ${students.length} siswa aktif\n`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

getStudentLogin();

